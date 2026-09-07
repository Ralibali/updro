-- A shared delivery workspace for an agency's own clients and accepted Updro offers.
create table public.agency_portals (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id) on delete restrict,
 source_offer_id uuid references public.offers(id) on delete restrict,
 title text not null check(length(btrim(title)) between 1 and 200),
 client_name text not null check(length(btrim(client_name)) between 1 and 200),
 client_contact text not null default '' check(length(client_contact)<=300),
 owner_contact text not null default '' check(length(owner_contact)<=300),
 brief text not null default '' check(length(brief)<=10000),
 deliveries jsonb not null default '[]'::jsonb check(jsonb_typeof(deliveries)='array'),
 extras jsonb not null default '[]'::jsonb check(jsonb_typeof(extras)='array'),
 history jsonb not null default '[]'::jsonb check(jsonb_typeof(history)='array'),
 revision integer not null default 1 check(revision>0),
 is_open boolean not null default true,
 token_hash text unique,
 token_expires_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index agency_portals_owner_updated_idx on public.agency_portals(owner_id,updated_at desc);
create unique index agency_portals_source_offer_idx on public.agency_portals(source_offer_id) where source_offer_id is not null;
alter table public.agency_portals enable row level security;
revoke all on public.agency_portals from anon,authenticated;
grant select on public.agency_portals to authenticated;
create policy "Agency owner reads portals" on public.agency_portals for select to authenticated using(owner_id=(select auth.uid()));

create function public.agency_portal_text(p_data jsonb,p_key text,p_label text,p_max integer,p_optional boolean default false)
returns text language plpgsql immutable set search_path='' as $$
declare v text;
begin
 if jsonb_typeof(p_data->p_key)='string' then v:=btrim(p_data->>p_key); end if;
 if p_optional and (v is null or v='') then return ''; end if;
 if v is null or length(v)=0 or length(v)>p_max then raise exception '% behöver vara 1–% tecken.',p_label,p_max; end if;
 return v;
end $$;
revoke all on function public.agency_portal_text(jsonb,text,text,integer,boolean) from public,anon,authenticated;

create function public.agency_portal_payload(p_id uuid,p_owner boolean)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',p.id,'title',p.title,'clientName',p.client_name,'ownerContact',p.owner_contact,
 'brief',p.brief,'deliveries',p.deliveries,'extras',p.extras,'history',p.history,'revision',p.revision,
 'isOpen',p.is_open,'createdAt',p.created_at,'updatedAt',p.updated_at,'sourceOfferId',p.source_offer_id,
 'isOwner',p_owner,'clientContact',case when p_owner then p.client_contact else null end,
 'linkExpiresAt',case when p_owner then p.token_expires_at else null end,
 'agencyName',coalesce(nullif(pr.company_name,''),nullif(pr.full_name,''),'Byrån'))
 from public.agency_portals p join public.profiles pr on pr.id=p.owner_id where p.id=p_id
$$;
revoke all on function public.agency_portal_payload(uuid,boolean) from public,anon,authenticated;

create function public.list_agency_portals()
returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'title',p.title,'clientName',p.client_name,
 'isOpen',p.is_open,'updatedAt',p.updated_at,'sourceOfferId',p.source_offer_id,
 'latestDelivery',p.deliveries->-1,'extraCount',jsonb_array_length(p.extras)) order by p.updated_at desc),'[]'::jsonb)
 from public.agency_portals p where p.owner_id=auth.uid()
$$;
revoke all on function public.list_agency_portals() from public,anon;
grant execute on function public.list_agency_portals() to authenticated;

create function public.get_agency_portal(p_id uuid default null,p_token text default null)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.agency_portals; v_owner boolean:=false; v_buyer boolean:=false;
begin
 if p_id is not null then
  select * into p from public.agency_portals where id=p_id;
  if p.id is not null then
   v_owner:=auth.uid() is not null and p.owner_id=auth.uid();
   v_buyer:=auth.uid() is not null and exists(select 1 from public.offers o join public.projects pr on pr.id=o.project_id where o.id=p.source_offer_id and pr.buyer_id=auth.uid());
  end if;
 end if;
 if not(v_owner or v_buyer) then
  if p_token is null or length(p_token)<>36 then raise exception 'Kundlänken är ogiltig eller har löpt ut.'; end if;
  select * into p from public.agency_portals where token_hash=encode(extensions.digest(p_token,'sha256'),'hex')
   and token_expires_at>now() and (p_id is null or id=p_id);
  if not found then raise exception 'Kundlänken är ogiltig eller har löpt ut.'; end if;
 end if;
 v_owner:=auth.uid() is not null and p.owner_id=auth.uid();
 return public.agency_portal_payload(p.id,v_owner);
end $$;
revoke all on function public.get_agency_portal(uuid,text) from public;
grant execute on function public.get_agency_portal(uuid,text) to anon,authenticated;

create function public.create_agency_portal(p_id uuid,p_data jsonb,p_source_offer_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); p public.agency_portals; v_context jsonb; v_offer public.offers; v_title text; v_client text; v_brief text;
begin
 if v_uid is null or not exists(select 1 from public.profiles where id=v_uid and role in ('supplier','admin')) then raise exception 'Logga in som byrå för att skapa kundportalen.'; end if;
 if p_id is null or jsonb_typeof(p_data) is distinct from 'object' then raise exception 'Kontrollera portalens uppgifter.'; end if;
 -- Serialize creation retries, including different request IDs for the same offer.
 perform pg_advisory_xact_lock(hashtextextended(coalesce(p_source_offer_id,p_id)::text,0));
 select * into p from public.agency_portals where id=p_id or (source_offer_id=p_source_offer_id and p_source_offer_id is not null);
 if found then
  if p.owner_id<>v_uid then raise exception 'Portalen kunde inte öppnas.'; end if;
  return public.agency_portal_payload(p.id,true);
 end if;
 if p_source_offer_id is not null then
  select * into v_offer from public.offers where id=p_source_offer_id and supplier_id=v_uid and status='accepted';
  if not found then raise exception 'Portalen måste kopplas till din accepterade offert.'; end if;
  v_context:=public.get_project_agreement(v_offer.project_id,v_offer.id)->'context';
  v_title:=left(v_context->>'projectTitle',200);v_client:=left(v_context->>'buyerName',200);v_brief:=left(coalesce(v_offer.description,''),10000);
 else
  v_title:=public.agency_portal_text(p_data,'title','Uppdragets namn',200);
  v_client:=public.agency_portal_text(p_data,'clientName','Kundens namn',200);
  v_brief:=public.agency_portal_text(p_data,'brief','Brief',10000,true);
 end if;
 insert into public.agency_portals(id,owner_id,source_offer_id,title,client_name,client_contact,owner_contact,brief,history)
 values(p_id,v_uid,p_source_offer_id,v_title,v_client,
 public.agency_portal_text(p_data,'clientContact','Kundkontakt',300,true),public.agency_portal_text(p_data,'ownerContact','Byråkontakt',300,true),v_brief,
 jsonb_build_array(jsonb_build_object('at',now(),'actor','Byrån','text','Kundportalen skapad.'))) returning * into p;
 return public.agency_portal_payload(p.id,true);
end $$;
revoke all on function public.create_agency_portal(uuid,jsonb,uuid) from public,anon;
grant execute on function public.create_agency_portal(uuid,jsonb,uuid) to authenticated;

create function public.change_agency_portal(p_id uuid,p_expected_revision integer,p_action text,p_data jsonb default '{}'::jsonb,p_token text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.agency_portals; v_owner boolean; v_buyer boolean; v_link boolean;
 v_actor text; v_event text; v_text text; v_item jsonb; v_index integer; v_price bigint; v_link_token text;
 v_decision text; v_result jsonb;
begin
 select * into p from public.agency_portals where id=p_id for update;
 if not found then raise exception 'Kundportalen är inte tillgänglig.'; end if;
 v_owner:=auth.uid() is not null and p.owner_id=auth.uid();
 v_buyer:=auth.uid() is not null and exists(select 1 from public.offers o join public.projects pr on pr.id=o.project_id where o.id=p.source_offer_id and pr.buyer_id=auth.uid());
 v_link:=p_token is not null and length(p_token)=36 and p.token_expires_at>now() and p.token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 if not(v_owner or v_buyer or coalesce(v_link,false)) then raise exception 'Kundportalen är inte tillgänglig.'; end if;
 if p_expected_revision is null or p_expected_revision<>p.revision then raise exception 'Portalen har uppdaterats. Hämta senaste versionen och granska igen.'; end if;
 if p_action is null or jsonb_typeof(p_data) is distinct from 'object' then raise exception 'Ogiltig åtgärd.'; end if;
 if not p.is_open and p_action not in ('reopen','revoke_link') then raise exception 'Portalen är avslutad. Kontakta byrån om något behöver ändras.'; end if;
 if jsonb_array_length(p.history)>=500 and p_action not in ('close','revoke_link') then raise exception 'Portalen har nått gränsen för historik. Skapa en ny portal för fortsatt arbete.'; end if;
 v_actor:=case when v_owner then 'Byrån' when v_buyer then 'Inloggad beställare' else 'Kund via delningslänk' end;
 if p_action='brief' then
  p.brief:=public.agency_portal_text(p_data,'brief','Brief',10000);
  v_event:='Gemensam brief uppdaterad. Tidigare leveransversioner behåller sitt underlag.';
 elsif p_action='details' then
  if not v_owner then raise exception 'Endast byrån kan ändra uppdragsuppgifterna.'; end if;
  p.title:=public.agency_portal_text(p_data,'title','Uppdragets namn',200);
  p.client_name:=public.agency_portal_text(p_data,'clientName','Kundens namn',200);
  p.client_contact:=public.agency_portal_text(p_data,'clientContact','Kundkontakt',300,true);
  p.owner_contact:=public.agency_portal_text(p_data,'ownerContact','Byråkontakt',300,true);
  v_event:='Uppdragsuppgifter uppdaterade.';
 elsif p_action='delivery' then
  if not v_owner then raise exception 'Endast byrån kan lägga upp leveranser.'; end if;
  if jsonb_array_length(p.deliveries)>=50 then raise exception 'Högst 50 leveransversioner per portal.'; end if;
  v_text:=public.agency_portal_text(p_data,'url','Leveranslänken',2000);
  if v_text!~'^https://[^[:space:]<>]+$' then raise exception 'Ange en fullständig säker länk som börjar med https://.'; end if;
  v_item:=jsonb_build_object('id',gen_random_uuid(),'version',jsonb_array_length(p.deliveries)+1,'title',public.agency_portal_text(p_data,'title','Leveransens namn',200),
   'description',public.agency_portal_text(p_data,'description','Leveransbeskrivning',5000),'url',v_text,'brief',p.brief,'createdAt',now(),'feedback','[]'::jsonb,'decision',null);
  p.deliveries:=p.deliveries||jsonb_build_array(v_item);
  v_event:='Leveransversion '||(v_item->>'version')||' upplagd för granskning.';
 elsif p_action in ('feedback','delivery_decision') then
  v_index:=jsonb_array_length(p.deliveries)-1;v_item:=p.deliveries->v_index;
  if v_item is null or p_data->>'version' is distinct from v_item->>'version' then raise exception 'Återkopplingen måste gälla den senaste leveransversionen.'; end if;
  if v_item->'decision'<>'null'::jsonb then raise exception 'Versionen har redan fått ett beslut. Byrån behöver lägga upp en ny version för en ny granskning.'; end if;
  if p_action='feedback' then
   if jsonb_array_length(v_item->'feedback')>=100 then raise exception 'Högst 100 kommentarer per leveransversion.'; end if;
   v_text:=public.agency_portal_text(p_data,'text','Återkoppling',5000);
   v_item:=jsonb_set(v_item,'{feedback}',(v_item->'feedback')||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'actor',v_actor,'at',now(),'text',v_text)));
   v_event:='Återkoppling på leveransversion '||(v_item->>'version')||'.';
  else
   if v_owner then raise exception 'Beställaren fattar beslut om leveransen.'; end if;
   v_decision:=p_data->>'decision';
   if v_decision is null or v_decision not in ('approved','changes_requested') then raise exception 'Välj godkänn eller begär ändringar.'; end if;
   if v_decision='approved' and p_data->'reviewed' is distinct from 'true'::jsonb then raise exception 'Bekräfta att du har granskat leveransversionen.'; end if;
   v_text:=public.agency_portal_text(p_data,'text','Beskriv önskade ändringar',5000,v_decision='approved');
   v_item:=jsonb_set(v_item,'{decision}',jsonb_build_object('status',v_decision,'actor',v_actor,'at',now(),'text',v_text));
   v_event:='Leveransversion '||(v_item->>'version')||case when v_decision='approved' then ' godkänd.' else ': ändringar begärda.' end;
  end if;
  p.deliveries:=jsonb_set(p.deliveries,array[v_index::text],v_item);
 elsif p_action='extra' then
  if not v_owner then raise exception 'Endast byrån kan föreslå prissatta tillägg.'; end if;
  if jsonb_array_length(p.extras)>=100 then raise exception 'Högst 100 tillägg per portal.'; end if;
  if (p_data->>'priceOre') is null or (p_data->>'priceOre')!~'^[0-9]{1,10}$' then raise exception 'Ange tilläggets totalpris i hela ören.'; end if;
  v_price:=(p_data->>'priceOre')::bigint;
  if v_price<0 or v_price>1000000000 then raise exception 'Kontrollera tilläggets totalpris.'; end if;
  v_item:=jsonb_build_object('id',gen_random_uuid(),'title',public.agency_portal_text(p_data,'title','Tilläggets namn',200),
   'description',public.agency_portal_text(p_data,'description','Omfattning och villkor',5000),'priceOre',v_price,'currency','SEK','status','proposed','createdAt',now(),'decision',null);
  p.extras:=p.extras||jsonb_build_array(v_item);v_event:='Prissatt tillägg föreslaget: '||(v_item->>'title')||'.';
 elsif p_action in ('extra_decision','withdraw_extra') then
  select value,(ordinality-1)::integer into v_item,v_index from jsonb_array_elements(p.extras) with ordinality where value->>'id'=p_data->>'id';
  if not found or v_item->>'status'<>'proposed' then raise exception 'Tillägget är inte längre öppet för beslut.'; end if;
  if p_action='withdraw_extra' then
   if not v_owner then raise exception 'Endast byrån kan återkalla ett tillägg.'; end if;
   v_decision:='withdrawn';v_text:='Återkallat av byrån.';
  else
   if v_owner then raise exception 'Beställaren fattar beslut om tillägg.'; end if;
   v_decision:=p_data->>'decision';
   if v_decision is null or v_decision not in ('approved','declined') then raise exception 'Välj godkänn eller avböj.'; end if;
   if v_decision='approved' and p_data->'confirmPrice' is distinct from 'true'::jsonb then raise exception 'Bekräfta tilläggets omfattning och totalpris exklusive moms.'; end if;
   v_text:=public.agency_portal_text(p_data,'text','Kommentar',1000,true);
  end if;
  v_item:=jsonb_set(jsonb_set(v_item,'{status}',to_jsonb(v_decision)),'{decision}',jsonb_build_object('actor',v_actor,'at',now(),'text',v_text));
  p.extras:=jsonb_set(p.extras,array[v_index::text],v_item);
  v_event:='Tillägg '||(v_item->>'title')||case v_decision when 'approved' then ' godkänt till överenskommet pris.' when 'declined' then ' avböjt.' else ' återkallat.' end;
 elsif p_action in ('create_link','revoke_link') then
  if not v_owner then raise exception 'Endast byrån kan hantera kundlänken.'; end if;
  if p_action='create_link' then
   v_link_token:=gen_random_uuid()::text;p.token_hash:=encode(extensions.digest(v_link_token,'sha256'),'hex');p.token_expires_at:=now()+interval '90 days';v_event:='Ny kundlänk skapad. Tidigare länk spärrad.';
  else p.token_hash:=null;p.token_expires_at:=null;v_event:='Kundlänken spärrad.'; end if;
 elsif p_action in ('close','reopen') then
  if not v_owner then raise exception 'Endast byrån kan avsluta eller öppna portalen.'; end if;
  p.is_open:=p_action='reopen';v_event:=case when p.is_open then 'Portalen öppnad igen.' else 'Portalen avslutad. Historiken finns kvar.' end;
 else raise exception 'Åtgärden stöds inte.';
 end if;
 p.history:=p.history||jsonb_build_array(jsonb_build_object('at',now(),'actor',v_actor,'text',v_event));
 update public.agency_portals set title=p.title,client_name=p.client_name,client_contact=p.client_contact,owner_contact=p.owner_contact,brief=p.brief,
 deliveries=p.deliveries,extras=p.extras,history=p.history,revision=revision+1,is_open=p.is_open,token_hash=p.token_hash,token_expires_at=p.token_expires_at,updated_at=now() where id=p.id;
 v_result:=public.agency_portal_payload(p.id,v_owner);
 if v_link_token is not null then v_result:=v_result||jsonb_build_object('newLinkToken',v_link_token); end if;
 return v_result;
end $$;
revoke all on function public.change_agency_portal(uuid,integer,text,jsonb,text) from public;
grant execute on function public.change_agency_portal(uuid,integer,text,jsonb,text) to anon,authenticated;
notify pgrst,'reload schema';

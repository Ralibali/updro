import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function public.is_admin(id uuid) returns boolean language sql stable as $$ select id='00000000-0000-4000-8000-000000000001'::uuid $$;
grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
await db.exec(await readFile('supabase/migrations/20260928065603_ai_visibility_workspaces.sql','utf8'));
async function actor(id, fn) {
  await db.exec('begin; set local role authenticated');
  try { await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id]); const result=await fn(); await db.exec('commit'); return result; }
  catch(e) { await db.exec('rollback'); throw e; }
}
const admin='00000000-0000-4000-8000-000000000001', buyer='00000000-0000-4000-8000-000000000002';
const result=await actor(admin,()=>db.query("insert into ai_visibility_workspaces(name,workspace) values('Customer','{}') returning id"));
const id=result.rows[0].id;
assert.equal((await actor(buyer,()=>db.query('select * from ai_visibility_workspaces'))).rows.length,0);
await assert.rejects(()=>actor(buyer,()=>db.query("insert into ai_visibility_workspaces(name) values('forbidden')")),/row-level security/);
assert.equal((await actor(buyer,()=>db.query('update ai_visibility_workspaces set name=$1 where id=$2 returning id',['stolen',id]))).rows.length,0);
await actor(admin,()=>db.query('update ai_visibility_workspaces set revision=2 where id=$1 and revision=1',[id]));
assert.equal((await actor(admin,()=>db.query('update ai_visibility_workspaces set revision=2 where id=$1 and revision=1 returning id',[id]))).rows.length,0);
await db.query("insert into ai_visibility_checks(workspace_id,prompt) values($1,'Test')",[id]);
await assert.rejects(()=>db.query("insert into ai_visibility_checks(workspace_id,prompt) values($1,'Test')",[id]),/unique/);
assert.equal((await actor(buyer,()=>db.query('select * from ai_visibility_checks'))).rows.length,0);
await assert.rejects(()=>actor(admin,()=>db.query("insert into ai_visibility_checks(workspace_id,prompt) values($1,'Fake')",[id])),/permission denied/);
await db.close(); console.log('Visibility DB: admin-only access, no buyer reads/writes, revision conflict and duplicate measurement reservation verified.');

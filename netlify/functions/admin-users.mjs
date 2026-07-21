import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function bearer(request) {
  const value = request.headers.get('authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

export default async (request) => {
  if (request.method === 'GET') {
    return json(200, {
      ok: true,
      function: 'admin-users',
      version: '2.0.0',
      configured: Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY)
    });
  }

  if (request.method !== 'POST') {
    return json(405, { error: 'POST 요청만 허용됩니다.' });
  }

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    return json(500, {
      error: 'Netlify 환경변수 SUPABASE_URL 또는 SUPABASE_SECRET_KEY가 없습니다.'
    });
  }

  const token = bearer(request);
  if (!token) return json(401, { error: '로그인이 필요합니다.' });

  const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData?.user) {
    return json(401, { error: '로그인 정보가 유효하지 않습니다.' });
  }

  const requesterId = authData.user.id;
  const { data: requester, error: requesterError } = await admin
    .from('profiles')
    .select('role,active')
    .eq('id', requesterId)
    .maybeSingle();

  if (requesterError) {
    return json(500, { error: `관리자 권한 확인 실패: ${requesterError.message}` });
  }

  if (!requester || requester.role !== 'admin' || !requester.active) {
    return json(403, { error: '활성화된 관리자만 직원 계정을 관리할 수 있습니다.' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: '요청 형식이 올바르지 않습니다.' });
  }

  try {
    switch (body.action) {
      case 'list': {
        const { data: userPage, error } = await admin.auth.admin.listUsers({
          page: 1,
          perPage: 1000
        });
        if (error) throw error;

        const ids = userPage.users.map(user => user.id);
        let profiles = [];
        if (ids.length) {
          const result = await admin
            .from('profiles')
            .select('id,name,role,active')
            .in('id', ids);
          if (result.error) throw result.error;
          profiles = result.data || [];
        }

        const profileMap = new Map(profiles.map(profile => [profile.id, profile]));
        const users = userPage.users.map(user => {
          const profile = profileMap.get(user.id);
          const email = user.email || '';
          return {
            id: user.id,
            name: profile?.name || user.user_metadata?.name || email.split('@')[0] || '이름 없음',
            login_id: email.endsWith('@login.otolab.co.kr')
              ? email.replace('@login.otolab.co.kr', '')
              : email,
            role: profile?.role || 'staff',
            active: profile?.active ?? true,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at
          };
        }).sort((a, b) => {
          if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
          return a.name.localeCompare(b.name, 'ko');
        });

        return json(200, { users });
      }

      case 'create': {
        const employee = body.employee || {};
        const loginId = String(employee.login_id || '').trim().toLowerCase();
        const name = String(employee.name || '').trim();
        const password = String(employee.password || '');
        const role = employee.role === 'admin' ? 'admin' : 'staff';

        if (!/^[a-z0-9._-]{3,30}$/.test(loginId)) {
          return json(400, { error: '아이디 형식이 올바르지 않습니다.' });
        }
        if (!name) return json(400, { error: '직원 이름을 입력하세요.' });
        if (password.length < 6) {
          return json(400, { error: '비밀번호는 최소 6자 이상이어야 합니다.' });
        }

        const email = `${loginId}@login.otolab.co.kr`;
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name }
        });
        if (error) throw error;

        const { error: profileError } = await admin.from('profiles').upsert({
          id: data.user.id,
          name,
          role,
          active: true
        });

        if (profileError) {
          await admin.auth.admin.deleteUser(data.user.id);
          throw profileError;
        }

        return json(200, { user_id: data.user.id });
      }

      case 'set_role': {
        const userId = String(body.user_id || '');
        const role = body.role === 'admin' ? 'admin' : 'staff';

        if (userId === requesterId && role !== 'admin') {
          return json(400, { error: '현재 로그인한 자신의 관리자 권한은 해제할 수 없습니다.' });
        }

        const { error } = await admin
          .from('profiles')
          .update({ role })
          .eq('id', userId);
        if (error) throw error;

        return json(200, { ok: true });
      }

      case 'set_active': {
        const userId = String(body.user_id || '');
        const active = Boolean(body.active);

        if (userId === requesterId && !active) {
          return json(400, { error: '현재 로그인한 자신의 계정은 중지할 수 없습니다.' });
        }

        const { error } = await admin
          .from('profiles')
          .update({ active })
          .eq('id', userId);
        if (error) throw error;

        return json(200, { ok: true });
      }

      case 'reset_password': {
        const userId = String(body.user_id || '');
        const password = String(body.password || '');

        if (password.length < 6) {
          return json(400, { error: '비밀번호는 최소 6자 이상이어야 합니다.' });
        }

        const { error } = await admin.auth.admin.updateUserById(userId, { password });
        if (error) throw error;

        return json(200, { ok: true });
      }

      case 'delete_user': {
        const userId = String(body.user_id || '');
        if (!userId) return json(400, { error: '삭제할 사용자 ID가 없습니다.' });
        if (userId === requesterId) {
          return json(400, { error: '현재 로그인한 자신의 계정은 삭제할 수 없습니다.' });
        }

        await admin.from('profiles').delete().eq('id', userId);
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) throw error;

        return json(200, { ok: true });
      }

      default:
        return json(400, { error: '지원하지 않는 작업입니다.' });
    }
  } catch (error) {
    const message = error?.message || '직원 관리 처리 중 오류가 발생했습니다.';
    const lower = message.toLowerCase();

    if (lower.includes('already') && lower.includes('registered')) {
      return json(400, { error: '이미 사용 중인 아이디입니다.' });
    }
    if (lower.includes('invalid api key')) {
      return json(500, { error: 'SUPABASE_SECRET_KEY가 올바르지 않습니다.' });
    }
    return json(400, { error: message });
  }
};

export const config = {
  path: '/api/admin-users'
};

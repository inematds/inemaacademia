-- Revisao 2026-10:
-- 1) handle_new_user gravava texto numa coluna enum "role" sem cast ->
--    "column role is of type role but expression is of type text" e todo
--    cadastro falhava ("Database error saving new user").
-- 2) O papel vinha livre do user_metadata: qualquer pessoa podia se cadastrar
--    como 'admin'. Agora o cadastro so aceita 'aluno' ou 'professor'.
-- 3) A policy "Users can update own profile" deixava o usuario trocar o
--    proprio role via API REST. Trigger abaixo bloqueia troca de role
--    por quem nao e admin (service role / SQL direto continuam podendo).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text := COALESCE(NEW.raw_user_meta_data->>'role', 'aluno');
  v_grade text := NULLIF(NEW.raw_user_meta_data->>'grade_level', '');
BEGIN
  IF v_role NOT IN ('aluno', 'professor') THEN
    v_role := 'aluno';
  END IF;
  IF v_grade IS NOT NULL AND v_grade NOT IN ('6-fund','7-fund','8-fund','9-fund','1-em','2-em','3-em') THEN
    v_grade := NULL;
  END IF;

  INSERT INTO public.profiles (id, full_name, role, grade_level, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email),
    v_role::public.role,
    v_grade::public.grade_level,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.prevent_role_self_change()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND COALESCE(public.get_my_role(), '') <> 'admin' THEN
    RAISE EXCEPTION 'Somente administradores podem alterar o papel (role) de um usuario';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_change();

-- 4) Professor adiciona aluno pelo e-mail (profiles nao guarda e-mail e o
--    client nao le auth.users). So professor/admin recebem resposta.
CREATE OR REPLACE FUNCTION public.find_student_id_by_email(p_email text)
RETURNS uuid AS $$
  SELECT u.id
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id AND p.role = 'aluno'
  WHERE public.get_my_role() IN ('professor', 'admin')
    AND lower(u.email) = lower(trim(p_email))
  LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth;

REVOKE ALL ON FUNCTION public.find_student_id_by_email(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.find_student_id_by_email(text) TO authenticated;

-- 5) Aluno entra na turma pelo codigo: o RLS de classes so mostra turmas
--    das quais o aluno ja participa, entao a busca pelo codigo nunca achava.
CREATE OR REPLACE FUNCTION public.find_class_by_code(p_code text)
RETURNS TABLE (id uuid, name text, is_active boolean) AS $$
  SELECT c.id, c.name, c.is_active
  FROM public.classes c
  WHERE auth.uid() IS NOT NULL
    AND c.code = upper(trim(p_code))
  LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.find_class_by_code(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.find_class_by_code(text) TO authenticated;

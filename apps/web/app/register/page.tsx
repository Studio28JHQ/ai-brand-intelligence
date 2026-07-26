import type { Metadata } from 'next';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Create Account — AI Visibility Auditor',
  description: 'Create your AI Visibility Auditor account.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}

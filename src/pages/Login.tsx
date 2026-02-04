import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  const handleDemo = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Bem-vindo</h1>
            <p className="text-slate-500">Faça login para acessar o sistema</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ou experimente agora</span>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              className="w-full" 
              onClick={handleDemo}
            >
              Acessar Versão Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
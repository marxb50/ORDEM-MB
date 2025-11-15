import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { ProfileType } from '../types';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>(ProfileType.FUNCIONARIO);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, profileType);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha ao cadastrar. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-selim-dark-blue flex flex-col justify-center py-12 sm:px-6 lg:px-8">
       <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-auto text-selim-green" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <h2 className="mt-6 text-3xl font-extrabold text-white">
          Criar nova conta
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input id="name" label="Nome" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="email" label="Endereço de e-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="password" label="Senha" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Select id="profileType" label="Tipo de usuário" value={profileType} onChange={(e) => setProfileType(e.target.value as ProfileType)}>
              {Object.values(ProfileType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" isLoading={isLoading} variant="primary">
              Cadastrar
            </Button>
            <div className="text-center text-sm">
              <Link to="/" className="font-medium text-selim-green hover:text-green-700">
                Já tem uma conta? Entrar
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProfileType } from '../types';
import { FuncionarioDashboard } from './dashboards/FuncionarioDashboard';
import { FiscalSelimDashboard } from './dashboards/FiscalSelimDashboard';
import { EmpresaMbDashboard } from './dashboards/EmpresaMbDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.profileType) {
      case ProfileType.FUNCIONARIO:
        return <FuncionarioDashboard />;
      case ProfileType.FISCAL_SELIM:
        return <FiscalSelimDashboard />;
      case ProfileType.EMPRESA_MB:
        return <EmpresaMbDashboard />;
      default:
        return <div className="text-center p-8">Invalid user profile. Please contact support.</div>;
    }
  };

  return <div className="w-full">{renderDashboard()}</div>;
};

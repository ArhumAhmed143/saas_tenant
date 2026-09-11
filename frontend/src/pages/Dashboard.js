import { useApp } from '../context/AppContext';
import PlatformOwnerDashboard from './PlatformOwnerDashboard';
import CompanyDashboard from './CompanyDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

export default function Dashboard() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Role ke hisaab se sahi dashboard render karo
  switch (currentUser.role) {
    case 'PlatformOwner':
      return <PlatformOwnerDashboard />;
    case 'Admin':
      return <CompanyDashboard />;
    case 'Manager':
      return <ManagerDashboard />;
    case 'Employee':
      return <EmployeeDashboard />;
    default:
      return <CompanyDashboard />;
  }
}
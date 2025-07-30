# ETS System Status Monitor

This document outlines a plan to implement a cost-effective system status monitoring solution for the ETS platform, providing visibility into the health of critical components.

## Overview

The Status Monitor will provide a central dashboard in the ETS Explorer application that displays the real-time health status of three key components:

1. **GraphQL Endpoints** (Subgraph availability)
2. **Airnode Oracle** (Oracle services availability)
3. **Offchain API** (Backend API services)

## Approach: Shared Status API

We'll implement a dedicated health endpoint in the offchain-api that performs all necessary health checks and returns aggregated status data. The Explorer app will fetch from this endpoint to display the status dashboard.

### Benefits

- **Leverages Existing Infrastructure**: No need for additional services or infrastructure
- **Centralized Logic**: Health check logic maintained in one place
- **Lightweight**: Minimal impact on application performance
- **Simple Implementation**: Can be implemented rapidly with existing skills
- **Extensible**: Easy to add new components to monitor

## Implementation Plan

### 1. Offchain API Enhancements

#### Create Health Check Services

```typescript
// In apps/offchain-api/src/services/health/subgraphHealth.ts
export async function checkSubgraphHealth(chainId: number, environment: string) {
  try {
    const startTime = Date.now();
    const endpoint = getSubgraphEndpoint(chainId, environment);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ __schema { types { name } } }'
      })
    });
    
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        status: 'error',
        message: `HTTP error ${response.status}`,
        latency,
        timestamp: new Date().toISOString()
      };
    }
    
    const data = await response.json();
    return {
      status: 'healthy',
      latency,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      latency: null,
      timestamp: new Date().toISOString()
    };
  }
}
```

#### Create Airnode Health Check

```typescript
// In apps/offchain-api/src/services/health/oracleHealth.ts
export async function checkOracleHealth(chainId: number, environment: string) {
  try {
    // 1. Check Oracle Gateway
    const startTime = Date.now();
    const gatewayUrl = getOracleGatewayUrl(environment);
    
    if (!gatewayUrl) {
      return {
        status: 'unknown',
        message: 'Gateway URL not configured',
        timestamp: new Date().toISOString()
      };
    }
    
    const response = await fetch(`${gatewayUrl}/health`);
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        status: 'error',
        message: `HTTP error ${response.status}`,
        latency,
        timestamp: new Date().toISOString()
      };
    }
    
    // 2. Check Contract Configuration
    const contractStatus = await checkOracleContractStatus(chainId, environment);
    
    return {
      status: 'healthy',
      gateway: {
        status: 'healthy',
        latency
      },
      contract: contractStatus,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

#### Create API Health Check

```typescript
// In apps/offchain-api/src/services/health/apiHealth.ts
export async function checkApiHealth() {
  const components = {
    database: await checkDatabaseConnection(),
    arweave: await checkArweaveConnection(),
    cache: await checkCacheService()
  };
  
  // Determine overall status based on components
  const hasErrors = Object.values(components).some(c => c.status === 'error');
  const hasWarnings = Object.values(components).some(c => c.status === 'warning');
  
  return {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy',
    components,
    timestamp: new Date().toISOString()
  };
}
```

#### Create Health API Endpoint

```typescript
// In apps/offchain-api/src/controllers/healthController.ts
export async function getSystemHealth(req: Request, res: Response) {
  try {
    const { chainId = 421614, environment = 'production' } = req.query;
    
    // Run checks in parallel
    const [subgraphStatus, oracleStatus, apiStatus] = await Promise.all([
      checkSubgraphHealth(Number(chainId), environment as string),
      checkOracleHealth(Number(chainId), environment as string),
      checkApiHealth()
    ]);
    
    const results = {
      timestamp: new Date().toISOString(),
      services: {
        subgraph: subgraphStatus,
        oracle: oracleStatus,
        api: apiStatus
      }
    };
    
    // Calculate overall status
    const hasErrors = Object.values(results.services).some(s => s.status === 'error');
    const hasWarnings = Object.values(results.services).some(s => s.status === 'warning');
    
    results.status = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy';
    
    res.json(results);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

#### Add Route

```typescript
// In apps/offchain-api/src/routes/healthRoutes.ts
import express from 'express';
import { getSystemHealth } from '../controllers/healthController';

const router = express.Router();

router.get('/system/health', getSystemHealth);

export default router;
```

### 2. Explorer App Implementation

#### Create Status Hooks

```typescript
// In apps/app/hooks/useSystemStatus.ts
import { useState, useEffect } from 'react';
import { useCurrentChain } from './useCurrentChain';
import { Environment } from '@ethereum-tag-service/sdk-core';

export function useSystemStatus(options = {}) {
  const { interval = 60000, environment = 'production' } = options;
  const { chainId } = useCurrentChain();
  const [status, setStatus] = useState({
    status: 'loading',
    services: {},
    timestamp: null,
    isLoading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true }));
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/health/system/health?chainId=${chainId}&environment=${environment}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        setStatus({
          ...data,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };
    
    // Fetch immediately
    fetchStatus();
    
    // Set up polling
    const timer = setInterval(fetchStatus, interval);
    
    // Clean up
    return () => clearInterval(timer);
  }, [chainId, environment, interval]);
  
  return status;
}
```

#### Create Status Components

```tsx
// In apps/app/components/status/StatusIndicator.tsx
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'react-feather';

export type StatusType = 'healthy' | 'warning' | 'error' | 'unknown' | 'loading';

interface StatusIndicatorProps {
  status: StatusType;
  size?: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, size = 24 }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle size={size} className="text-green-500" />;
    case 'warning':
      return <AlertCircle size={size} className="text-yellow-500" />;
    case 'error':
      return <XCircle size={size} className="text-red-500" />;
    case 'loading':
      return <div className="animate-pulse h-6 w-6 bg-gray-200 rounded-full" />;
    default:
      return <AlertCircle size={size} className="text-gray-400" />;
  }
};
```

#### Create Status Dashboard

```tsx
// In apps/app/components/status/StatusDashboard.tsx
import React from 'react';
import { useSystemStatus } from '../../hooks/useSystemStatus';
import { StatusIndicator } from './StatusIndicator';
import { useSystem } from '../../hooks/useSystem';
import TimeAgo from '../TimeAgo';

export const StatusDashboard: React.FC = () => {
  const { environment } = useSystem();
  const { status, services, timestamp, isLoading, error } = useSystemStatus({
    environment,
    interval: 30000 // Check every 30 seconds
  });
  
  if (isLoading) {
    return <div className="p-6">Loading system status...</div>;
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Status Monitor Error</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">System Status</h2>
        <div className="flex items-center gap-2">
          <StatusIndicator status={status} />
          <span className="font-medium">{status === 'healthy' ? 'All Systems Operational' : 'System Degraded'}</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-6">
        Last updated <TimeAgo date={timestamp} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subgraph Status */}
        <ServiceCard 
          title="Subgraph API" 
          status={services?.subgraph?.status} 
          details={services?.subgraph} 
        />
        
        {/* Oracle Status */}
        <ServiceCard 
          title="Airnode Oracle" 
          status={services?.oracle?.status} 
          details={services?.oracle} 
        />
        
        {/* API Status */}
        <ServiceCard 
          title="Offchain API" 
          status={services?.api?.status} 
          details={services?.api} 
        />
      </div>
    </div>
  );
};

interface ServiceCardProps {
  title: string;
  status: StatusType;
  details: any;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, status, details }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <StatusIndicator status={status} size={20} />
      </div>
      
      {status === 'error' && (
        <p className="text-sm text-red-600 mb-3">{details?.message || 'Service is experiencing issues'}</p>
      )}
      
      {details?.latency && (
        <div className="text-sm text-gray-600">
          Response time: {details.latency}ms
        </div>
      )}
      
      {details?.components && (
        <div className="mt-3 border-t pt-3">
          <h4 className="text-sm font-medium mb-2">Components</h4>
          {Object.entries(details.components).map(([name, data]) => (
            <div key={name} className="flex items-center justify-between text-sm mb-1">
              <span className="capitalize">{name}</span>
              <StatusIndicator status={data.status} size={16} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### Add Status Page to Explorer

```tsx
// In apps/app/pages/status.tsx
import React from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../layouts/default';
import { StatusDashboard } from '../components/status/StatusDashboard';

const StatusPage: NextPage = () => {
  const { t } = useTranslation('common');
  
  return (
    <Layout title={t('status.title')} description={t('status.description')}>
      <div className="container mx-auto py-8">
        <StatusDashboard />
      </div>
    </Layout>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default StatusPage;
```

#### Add Navigation Link

```tsx
// In apps/app/components/Navigation.tsx
// Add to navigation links array
const navLinks = [
  // ... existing links
  {
    href: '/status',
    label: 'System Status',
    icon: <ServerIcon className="w-5 h-5" />,
    admin: true // Only show for admin users, if desired
  },
];
```

## Future Enhancements

1. **Historical Data**:
   - Store status check history in a lightweight database
   - Display uptime percentages and historical charts
   - Track performance trends over time

2. **Alerting**:
   - Implement WebHook integration for Discord/Slack notifications
   - Add email alerts for critical issues
   - Create admin-only notification settings

3. **Expanded Monitoring**:
   - Add performance metrics like transaction volume
   - Monitor smart contract events
   - Track gas prices and network congestion

4. **User-Facing Status**:
   - Simplified public status indicator in app footer
   - User notifications for service degradation
   - Maintenance mode announcements

## Implementation Timeline

| Task                                  | Estimated Effort |
|---------------------------------------|------------------|
| Offchain API Health Check Services    | 1 day            |
| Health API Endpoint                   | 0.5 day          |
| Explorer Status Components            | 1 day            |
| Status Dashboard Page                 | 0.5 day          |
| Testing & Integration                 | 1 day            |
| **Total**                             | **4 days**       |

## Conclusion

This lightweight monitoring solution provides valuable visibility into the ETS platform's health without requiring additional infrastructure. By leveraging the existing offchain API and Explorer app, we can create a comprehensive status dashboard that helps identify and address issues quickly.
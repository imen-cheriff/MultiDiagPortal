import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Summary KPIs
  summaryKpis = [
    {
      title: 'Total Diagnostics',
      value: '1,248',
      icon: 'analytics',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Active Projects',
      value: '42',
      icon: 'folder_open',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Success Rate',
      value: '94.8%',
      icon: 'check_circle',
      trend: '+2.4%',
      trendUp: true,
    },
    {
      title: 'System Health',
      value: '98.2%',
      icon: 'health_and_safety',
      trend: '-0.5%',
      trendUp: false,
    },
  ];

  // Diagnostic metrics
  diagnosticMetrics = [
    {
      title: 'ECU Diagnostics',
      value: '586',
      maxValue: 1000,
      percentage: 58.6,
    },
    {
      title: 'Sensor Calibrations',
      value: '423',
      maxValue: 500,
      percentage: 84.6,
    },
    {
      title: 'Performance Tests',
      value: '239',
      maxValue: 300,
      percentage: 79.7,
    },
  ];

  // Performance indicators
  performanceData = [
    { label: 'Response Time', value: '124ms', status: 'excellent' },
    { label: 'Processing Speed', value: '3.2 GB/s', status: 'good' },
    { label: 'Memory Usage', value: '68%', status: 'warning' },
    { label: 'CPU Load', value: '42%', status: 'good' },
    { label: 'Network Latency', value: '18ms', status: 'excellent' },
  ];

  // System health
  systemHealth = [
    {
      name: 'Diagnostic Server',
      status: 'online',
      uptime: '99.8%',
      lastIncident: '12d ago',
    },
    {
      name: 'ECU Database',
      status: 'online',
      uptime: '100%',
      lastIncident: '30d+ ago',
    },
    {
      name: 'Calibration Tools',
      status: 'maintenance',
      uptime: '85.2%',
      lastIncident: 'Ongoing',
    },
    {
      name: 'Cloud Sync',
      status: 'online',
      uptime: '99.5%',
      lastIncident: '5d ago',
    },
  ];

  // Recent activities
  recentActivities = [
    {
      time: '10:45 AM',
      action: 'Database Update',
      description: 'ECU database updated with 15 new vehicle models',
      severity: 'info',
    },
    {
      time: '09:30 AM',
      action: 'Project Completion',
      description: 'BMW X5 ECU Optimization - Phase 2 completed',
      severity: 'success',
    },
    {
      time: '08:15 AM',
      action: 'System Alert',
      description: 'High memory usage detected on diagnostic server',
      severity: 'warning',
    },
    {
      time: 'Yesterday',
      action: 'Maintenance',
      description: 'Calibration tools scheduled for maintenance at 22:00',
      severity: 'info',
    },
    {
      time: 'Yesterday',
      action: 'Error Detected',
      description: 'Failed connection attempt to remote diagnostic unit',
      severity: 'error',
    },
  ];

  // Vehicle models with diagnostic data
  vehicleModels = [
    {
      make: 'BMW',
      model: 'X5',
      year: '2025',
      diagnosticCount: 86,
      status: 'active',
    },
    {
      make: 'Mercedes',
      model: 'E-Class',
      year: '2024',
      diagnosticCount: 64,
      status: 'active',
    },
    {
      make: 'Audi',
      model: 'A4',
      year: '2025',
      diagnosticCount: 52,
      status: 'active',
    },
    {
      make: 'Tesla',
      model: 'Model 3',
      year: '2024',
      diagnosticCount: 48,
      status: 'pending',
    },
    {
      make: 'Porsche',
      model: 'Taycan',
      year: '2025',
      diagnosticCount: 37,
      status: 'active',
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  // Get status class for styling
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'online':
        return 'status-online';
      case 'maintenance':
        return 'status-maintenance';
      case 'offline':
        return 'status-offline';
      default:
        return '';
    }
  }

  // Get severity class
  getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'success':
        return 'severity-success';
      case 'info':
        return 'severity-info';
      case 'warning':
        return 'severity-warning';
      case 'error':
        return 'severity-error';
      default:
        return '';
    }
  }

  // Get performance status class
  getPerformanceClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'status-excellent';
      case 'good':
        return 'status-good';
      case 'warning':
        return 'status-warning';
      case 'critical':
        return 'status-critical';
      default:
        return '';
    }
  }

  // Get vehicle status class
  getVehicleStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'vehicle-active';
      case 'pending':
        return 'vehicle-pending';
      case 'inactive':
        return 'vehicle-inactive';
      default:
        return '';
    }
  }
}

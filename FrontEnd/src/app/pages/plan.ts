import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface YearSummary {
  year: number;
  totalPlans: number;
  completedPlans: number;
  inProgressPlans: number;
}

interface Metric {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
}

interface Car {
  id: string;
  brand: string;
  model: string;
  targetDate: Date;
  responsible: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  notes: string;
}

interface Plan {
  id: string;
  title: string;
  description: string;
  type: 'goals' | 'advancement' | 'roadmap' | 'budget' | 'resources';
  status: 'draft' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  metrics: Metric[];
  cars: Car[];
}

@Component({
  selector: 'app-planification',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule],
  templateUrl: './plan.html',
  styleUrls: ['./plan.scss'],
})
export class PlanificationComponent implements OnInit {
  // Years data
  years: YearSummary[] = [];
  selectedYear: number | null = null;

  // Plans data
  plans: Plan[] = [];
  selectedPlan: Plan | null = null;
  filterText = '';

  // UI states
  isCreatingPlan = false;
  editMode = false;

  // Tab navigation
  activeTab: 'years' | 'plans' | 'metrics' | 'cars' = 'years';
  detailsTab: 'overview' | 'metrics' | 'cars' | 'notes' = 'overview';

  // New plan form data
  newPlanTitle = '';
  newPlanDescription = '';
  newPlanType: 'goals' | 'advancement' | 'roadmap' | 'budget' | 'resources' =
    'goals';

  constructor() {}

  ngOnInit(): void {
    this.initializeData();
  }

  initializeData(): void {
    // Initialize years data
    const currentYear = new Date().getFullYear();
    this.years = [
      {
        year: currentYear - 1,
        totalPlans: 12,
        completedPlans: 10,
        inProgressPlans: 2,
      },
      {
        year: currentYear,
        totalPlans: 15,
        completedPlans: 5,
        inProgressPlans: 10,
      },
      {
        year: currentYear + 1,
        totalPlans: 8,
        completedPlans: 0,
        inProgressPlans: 8,
      },
    ];

    // Initialize plans data (this would come from a service in a real app)
    this.plans = this.generateMockPlans();
  }

  generateMockPlans(): Plan[] {
    const planTypes: (
      | 'goals'
      | 'advancement'
      | 'roadmap'
      | 'budget'
      | 'resources'
    )[] = ['goals', 'advancement', 'roadmap', 'budget', 'resources'];

    const planStatuses: (
      | 'draft'
      | 'in-progress'
      | 'completed'
      | 'cancelled'
    )[] = ['draft', 'in-progress', 'completed', 'cancelled'];

    const plans: Plan[] = [];
    const currentYear = new Date().getFullYear();

    // Generate plans for each year
    this.years.forEach((yearSummary) => {
      const yearPlans: Plan[] = [];

      for (let i = 1; i <= yearSummary.totalPlans; i++) {
        const planType =
          planTypes[Math.floor(Math.random() * planTypes.length)];
        const planStatus =
          planStatuses[Math.floor(Math.random() * planStatuses.length)];

        yearPlans.push({
          id: `plan-${yearSummary.year}-${i}`,
          title: `${
            planType.charAt(0).toUpperCase() + planType.slice(1)
          } Plan ${i}`,
          description: `This is a ${planType} plan for the year ${yearSummary.year}. It includes various objectives and metrics to track progress.`,
          type: planType,
          status: planStatus,
          createdAt: new Date(
            yearSummary.year,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          updatedAt: new Date(
            yearSummary.year,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          metrics: this.generateMockMetrics(Math.floor(Math.random() * 5) + 1),
          cars: this.generateMockCars(
            Math.floor(Math.random() * 5) + 1,
            yearSummary.year
          ),
        });
      }

      plans.push(...yearPlans);
    });

    return plans;
  }

  generateMockMetrics(count: number): Metric[] {
    const metrics: Metric[] = [];
    const metricNames = [
      'Sales',
      'Production',
      'Efficiency',
      'Quality',
      'Customer Satisfaction',
      'Market Share',
    ];
    const units = ['%', 'units', 'points', 'M€', 'days'];

    for (let i = 1; i <= count; i++) {
      const target = Math.floor(Math.random() * 100) + 50;
      const current = Math.floor(Math.random() * target);
      const unit = units[Math.floor(Math.random() * units.length)];
      const name = metricNames[Math.floor(Math.random() * metricNames.length)];

      metrics.push({
        id: `metric-${i}`,
        name: `${name} ${i}`,
        current: current,
        target: target,
        unit: unit,
      });
    }

    return metrics;
  }

  generateMockCars(count: number, year: number): Car[] {
    const cars: Car[] = [];
    const brands = [
      'Renault',
      'Peugeot',
      'Citroën',
      'Toyota',
      'Volkswagen',
      'BMW',
      'Mercedes',
    ];
    const models = [
      'Model A',
      'Model B',
      'Model C',
      'SUV',
      'Sedan',
      'Compact',
      'Electric',
    ];
    const statuses: ('planned' | 'in-progress' | 'completed' | 'delayed')[] = [
      'planned',
      'in-progress',
      'completed',
      'delayed',
    ];
    const responsibles = [
      'John Doe',
      'Jane Smith',
      'Robert Johnson',
      'Emily Davis',
      'Michael Brown',
    ];

    for (let i = 1; i <= count; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const responsible =
        responsibles[Math.floor(Math.random() * responsibles.length)];

      cars.push({
        id: `car-${i}`,
        brand: brand,
        model: model,
        targetDate: new Date(
          year,
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        responsible: responsible,
        status: status,
        notes: `Notes for ${brand} ${model}. This car is currently in ${status} status.`,
      });
    }

    return cars;
  }

  // Tab navigation methods
  setActiveTab(tab: 'years' | 'plans' | 'metrics' | 'cars'): void {
    this.activeTab = tab;

    // Reset creation mode when switching tabs
    if (tab !== 'plans') {
      this.isCreatingPlan = false;
    }
  }

  setDetailsTab(tab: 'overview' | 'metrics' | 'cars' | 'notes'): void {
    this.detailsTab = tab;
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    this.selectedPlan = null;
    this.isCreatingPlan = false;
    this.editMode = false;

    // Automatically switch to plans tab after selecting a year
    this.setActiveTab('plans');
  }

  getFilteredPlans(): Plan[] {
    if (!this.selectedYear) return [];

    // Filter plans by selected year
    let filteredPlans = this.plans.filter((plan) => {
      const planYear = new Date(plan.createdAt).getFullYear();
      return planYear === this.selectedYear;
    });

    // Apply text filter if provided
    if (this.filterText.trim()) {
      const searchText = this.filterText.toLowerCase();
      filteredPlans = filteredPlans.filter(
        (plan) =>
          plan.title.toLowerCase().includes(searchText) ||
          plan.description.toLowerCase().includes(searchText) ||
          plan.type.toLowerCase().includes(searchText)
      );
    }

    return filteredPlans;
  }

  selectPlan(plan: Plan): void {
    this.selectedPlan = plan;
    this.isCreatingPlan = false;
    this.editMode = false;
    this.detailsTab = 'overview';
  }

  startCreatePlan(): void {
    this.isCreatingPlan = true;
    this.selectedPlan = null;
    this.newPlanTitle = '';
    this.newPlanDescription = '';
    this.newPlanType = 'goals';
  }

  cancelCreatePlan(): void {
    this.isCreatingPlan = false;
  }

  createPlan(): void {
    if (!this.newPlanTitle.trim() || !this.selectedYear) return;

    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      title: this.newPlanTitle,
      description: this.newPlanDescription,
      type: this.newPlanType,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: [],
      cars: [],
    };

    this.plans.push(newPlan);

    // Update year summary
    const yearIndex = this.years.findIndex((y) => y.year === this.selectedYear);
    if (yearIndex !== -1) {
      this.years[yearIndex].totalPlans++;
      this.years[yearIndex].inProgressPlans++;
    }

    this.isCreatingPlan = false;
    this.selectPlan(newPlan);
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  addMetric(): void {
    if (!this.selectedPlan) return;

    const newMetric: Metric = {
      id: `metric-${Date.now()}`,
      name: 'New Metric',
      current: 0,
      target: 100,
      unit: '%',
    };

    this.selectedPlan.metrics.push(newMetric);
    this.selectedPlan.updatedAt = new Date();
  }

  removeMetric(metricId: string): void {
    if (!this.selectedPlan) return;

    const index = this.selectedPlan.metrics.findIndex((m) => m.id === metricId);
    if (index !== -1) {
      this.selectedPlan.metrics.splice(index, 1);
      this.selectedPlan.updatedAt = new Date();
    }
  }

  addCar(): void {
    if (!this.selectedPlan || !this.selectedYear) return;

    const newCar: Car = {
      id: `car-${Date.now()}`,
      brand: 'New Brand',
      model: 'New Model',
      targetDate: new Date(this.selectedYear, 11, 31),
      responsible: 'Unassigned',
      status: 'planned',
      notes: '',
    };

    this.selectedPlan.cars.push(newCar);
    this.selectedPlan.updatedAt = new Date();
  }

  removeCar(carId: string): void {
    if (!this.selectedPlan) return;

    const index = this.selectedPlan.cars.findIndex((c) => c.id === carId);
    if (index !== -1) {
      this.selectedPlan.cars.splice(index, 1);
      this.selectedPlan.updatedAt = new Date();
    }
  }

  getProgressPercentage(metric: Metric): number {
    if (metric.target === 0) return 0;
    const percentage = (metric.current / metric.target) * 100;
    return Math.min(100, Math.max(0, percentage));
  }

  getPlanTypeIcon(type: string): string {
    switch (type) {
      case 'goals':
        return 'flag';
      case 'advancement':
        return 'trending_up';
      case 'roadmap':
        return 'map';
      case 'budget':
        return 'attach_money';
      case 'resources':
        return 'people';
      default:
        return 'description';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'draft':
        return 'edit';
      case 'in-progress':
        return 'hourglass_top';
      case 'completed':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getPlanStatusClass(status: string): string {
    return `status-${status}`;
  }

  getCarStatusClass(status: string): string {
    return `status-${status}`;
  }

  addyears(): void {
    // Find the maximum year
    const maxYear = Math.max(...this.years.map((y) => y.year));

    // Add a new year
    this.years.push({
      year: maxYear + 1,
      totalPlans: 0,
      completedPlans: 0,
      inProgressPlans: 0,
    });

    // Sort years in descending order
    this.years.sort((a, b) => b.year - a.year);
  }

  // Helper methods for the metrics and cars tabs
  hasAnyMetrics(): boolean {
    return this.getFilteredPlans().some((plan) => plan.metrics.length > 0);
  }

  hasAnyCars(): boolean {
    return this.getFilteredPlans().some((plan) => plan.cars.length > 0);
  }
}

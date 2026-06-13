import { Injectable } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { MaintenanceService } from './maintenance.service';
import { DispatchService } from './dispatch.service';
import { VehicleService } from './vehicle.service';
import { CostSummary, CostDetailResponse, FuelCostDetail, MaintenanceCostDetail, TollCostDetail } from '../types/interfaces';
import { calculateTotalCost, calculateProfit } from '../utils/costCalculator';

@Injectable()
export class CostService {
  constructor(
    private readonly fuelService: FuelService,
    private readonly maintenanceService: MaintenanceService,
    private readonly dispatchService: DispatchService,
    private readonly vehicleService: VehicleService,
  ) {}

  private getMonthFromDate(dateStr: string): string {
    return dateStr.substring(0, 7);
  }

  findAll(): CostSummary[] {
    const vehicles = this.vehicleService.findAll() as any[];
    const fuelRecords = this.fuelService.findAll() as any[];
    const maintenanceRecords = this.maintenanceService.findAll() as any[];
    const dispatchOrders = this.dispatchService.findAll() as any[];

    const summaryMap = new Map<string, CostSummary>();
    let idCounter = 1;

    const addOrUpdateSummary = (vehicleId: number, month: string) => {
      const key = `${vehicleId}-${month}`;
      if (!summaryMap.has(key)) {
        const vehicle = vehicles.find((v: any) => v.id === vehicleId);
        const daysInMonth = new Date(parseInt(month.substring(0, 4)), parseInt(month.substring(5, 7)), 0).getDate();
        summaryMap.set(key, {
          id: idCounter++,
          vehicleId,
          plateNo: vehicle ? vehicle.plateNo : '',
          month,
          fuelTotal: 0,
          maintenanceTotal: 0,
          tollTotal: 0,
          laborTotal: 0,
          fixedCost: vehicle ? vehicle.dailyFixedCost * daysInMonth : 0,
          totalCost: 0,
          totalRevenue: 0,
          profit: 0,
        });
      }
      return summaryMap.get(key)!;
    };

    fuelRecords.forEach((record: any) => {
      const month = this.getMonthFromDate(record.date);
      const summary = addOrUpdateSummary(record.vehicleId, month);
      summary.fuelTotal += record.totalAmount;
    });

    maintenanceRecords.forEach((record: any) => {
      const month = this.getMonthFromDate(record.date);
      const summary = addOrUpdateSummary(record.vehicleId, month);
      summary.maintenanceTotal += record.cost;
    });

    dispatchOrders.forEach((order: any) => {
      const month = this.getMonthFromDate(order.planDepartAt);
      const summary = addOrUpdateSummary(order.vehicleId, month);
      summary.tollTotal += order.estimatedTollCost;
      summary.totalRevenue += order.freight;
    });

    summaryMap.forEach((summary) => {
      summary.totalCost = calculateTotalCost(
        summary.fuelTotal,
        summary.maintenanceTotal,
        summary.tollTotal,
        summary.laborTotal,
        summary.fixedCost,
      );
      summary.profit = calculateProfit(
        summary.totalRevenue,
        summary.fuelTotal,
        summary.tollTotal,
        summary.laborTotal,
      );
    });

    return Array.from(summaryMap.values());
  }

  findOne(id: number): CostSummary | undefined {
    return this.findAll().find((item) => item.id === id);
  }

  findDetail(vehicleId: number, month: string): CostDetailResponse | undefined {
    const vehicles = this.vehicleService.findAll() as any[];
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) return undefined;

    const fuelRecords = this.fuelService.findAll() as any[];
    const maintenanceRecords = this.maintenanceService.findAll() as any[];
    const dispatchOrders = this.dispatchService.findAll() as any[];

    const fuelDetails: FuelCostDetail[] = fuelRecords
      .filter((r: any) => r.vehicleId === vehicleId && this.getMonthFromDate(r.date) === month)
      .map((r: any) => ({
        id: r.id,
        date: r.date,
        liters: r.liters,
        unitPrice: r.unitPrice,
        totalAmount: r.totalAmount,
        station: r.station,
        paymentMethod: r.paymentMethod,
        mileage: r.mileage,
        driverId: r.driverId,
        dispatchOrderId: r.dispatchOrderId,
      }));

    const maintenanceDetails: MaintenanceCostDetail[] = maintenanceRecords
      .filter((r: any) => r.vehicleId === vehicleId && this.getMonthFromDate(r.date) === month)
      .map((r: any) => ({
        id: r.id,
        date: r.date,
        maintenanceType: r.maintenanceType,
        item: r.item,
        cost: r.cost,
        vendor: r.vendor,
        status: r.status,
      }));

    const tollDetails: TollCostDetail[] = dispatchOrders
      .filter((o: any) => o.vehicleId === vehicleId && this.getMonthFromDate(o.planDepartAt) === month)
      .map((o: any) => ({
        id: o.id,
        orderNo: o.orderNo,
        origin: o.origin,
        destination: o.destination,
        estimatedTollCost: o.estimatedTollCost,
        planDepartAt: o.planDepartAt,
        status: o.status,
      }));

    const fuelTotal = fuelDetails.reduce((sum, d) => sum + d.totalAmount, 0);
    const maintenanceTotal = maintenanceDetails.reduce((sum, d) => sum + d.cost, 0);
    const tollTotal = tollDetails.reduce((sum, d) => sum + d.estimatedTollCost, 0);
    const totalRevenue = dispatchOrders
      .filter((o: any) => o.vehicleId === vehicleId && this.getMonthFromDate(o.planDepartAt) === month)
      .reduce((sum: number, o: any) => sum + o.freight, 0);

    const daysInMonth = new Date(parseInt(month.substring(0, 4)), parseInt(month.substring(5, 7)), 0).getDate();
    const fixedCost = vehicle.dailyFixedCost * daysInMonth;
    const laborTotal = 0;
    const totalCost = calculateTotalCost(fuelTotal, maintenanceTotal, tollTotal, laborTotal, fixedCost);
    const profit = calculateProfit(totalRevenue, fuelTotal, tollTotal, laborTotal);

    return {
      vehicleId,
      plateNo: vehicle.plateNo,
      month,
      fuelTotal,
      maintenanceTotal,
      tollTotal,
      laborTotal,
      fixedCost,
      totalCost,
      totalRevenue,
      profit,
      fuelDetails,
      maintenanceDetails,
      tollDetails,
    };
  }

  create(payload: any) {
    return payload;
  }
}

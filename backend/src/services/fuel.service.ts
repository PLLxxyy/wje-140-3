import { Injectable } from '@nestjs/common';
@Injectable()
export class FuelService {
  private rows = [
    { id: 1, vehicleId: 1, driverId: 1, dispatchOrderId: 1, liters: 240, unitPrice: 7.4, totalAmount: 1776, mileage: 88120, station: '青浦服务区', paymentMethod: 'Company', date: '2026-06-03' },
    { id: 2, vehicleId: 1, driverId: 1, dispatchOrderId: null, liters: 180, unitPrice: 7.35, totalAmount: 1323, mileage: 88500, station: '杭州萧山加油站', paymentMethod: 'Company', date: '2026-06-14' },
    { id: 3, vehicleId: 1, driverId: 1, dispatchOrderId: null, liters: 200, unitPrice: 7.42, totalAmount: 1484, mileage: 89000, station: '上海嘉定服务区', paymentMethod: 'Company', date: '2026-06-25' },
  ];
  findAll() { return this.rows; }
  findOne(id: number) { return this.rows.find((item: any) => item.id === id); }
  create(payload: any) { const row = { ...payload, id: this.rows.length + 1 }; this.rows.push(row); return row; }
}

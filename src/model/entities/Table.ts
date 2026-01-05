//Definindo contrato para a o pedido de uma mesa
export type TableOrder = { id: string; name: string; price: number; quantity: number };

//Defindo o contrato para a mesa
export type Table = {
  id: string;
  accessCode: string;
  name: string;
  waiterName?: string;
  notes?: string;
  orders?: TableOrder[];
  total?: number;
  createdAt: number;
  updatedAt?: number;
}

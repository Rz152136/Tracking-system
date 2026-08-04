import OrderForm from './OrderForm'
import OrderList from './OrderList'

export default function OrdersPage({ orders, loading }) {
  return (
    <div>
      <OrderForm orders={orders} />
      <OrderList orders={orders} loading={loading} />
    </div>
  )
}

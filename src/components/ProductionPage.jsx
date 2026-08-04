import ProductionForm from './ProductionForm'
import ProductionList from './ProductionList'

export default function ProductionPage({ orders, productions, loading }) {
  return (
    <div>
      <ProductionForm orders={orders} />
      <ProductionList productions={productions} loading={loading} />
    </div>
  )
}

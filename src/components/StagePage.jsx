import StageForm from './StageForm'
import StageList from './StageList'

export default function StagePage({ collectionName, stageLabel, orders, entries, loading }) {
  return (
    <div>
      <StageForm collectionName={collectionName} stageLabel={stageLabel} orders={orders} />
      <StageList
        collectionName={collectionName}
        stageLabel={stageLabel}
        entries={entries}
        loading={loading}
      />
    </div>
  )
}

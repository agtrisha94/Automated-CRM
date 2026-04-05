/**
 * ConfusionMatricesGrid Component
 * 3x2x2 confusion matrices for RULE, LR, RF models
 */
import { Card } from '@/components/ui'
import { ConfusionMatrix } from './ConfusionMatrix'

interface ConfusionMatricesGridProps {
  matrices: {
    rules: { tp: number; fp: number; tn: number; fn: number }
    lr: { tp: number; fp: number; tn: number; fn: number }
    rf: { tp: number; fp: number; tn: number; fn: number }
  }
}

export function ConfusionMatricesGrid({ matrices }: ConfusionMatricesGridProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Confusion Matrices</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConfusionMatrix
          title="Rule-Based"
          truePositive={matrices.rules.tp}
          falsePositive={matrices.rules.fp}
          trueNegative={matrices.rules.tn}
          falseNegative={matrices.rules.fn}
        />
        <ConfusionMatrix
          title="Logistic Regression"
          truePositive={matrices.lr.tp}
          falsePositive={matrices.lr.fp}
          trueNegative={matrices.lr.tn}
          falseNegative={matrices.lr.fn}
        />
        <ConfusionMatrix
          title="Random Forest"
          truePositive={matrices.rf.tp}
          falsePositive={matrices.rf.fp}
          trueNegative={matrices.rf.tn}
          falseNegative={matrices.rf.fn}
        />
      </div>
    </Card>
  )
}

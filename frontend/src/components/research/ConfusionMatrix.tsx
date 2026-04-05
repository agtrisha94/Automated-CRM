/**
 * ConfusionMatrix Component
 * 2x2 matrix display for binary classification metrics
 */
import { Card } from '@/components/ui'

interface ConfusionMatrixProps {
  title: string
  truePositive: number
  falsePositive: number
  trueNegative: number
  falseNegative: number
}

export function ConfusionMatrix({
  title,
  truePositive,
  falsePositive,
  trueNegative,
  falseNegative,
}: ConfusionMatrixProps) {
  const total = truePositive + falsePositive + trueNegative + falseNegative

  const getPercentage = (value: number) => ((value / total) * 100).toFixed(1)

  return (
    <Card className="p-4">
      <h4 className="text-base font-semibold text-gray-900 mb-4 text-center">{title}</h4>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-100 p-2"></th>
            <th className="border border-gray-300 bg-gray-100 p-2 font-semibold">Predicted +</th>
            <th className="border border-gray-300 bg-gray-100 p-2 font-semibold">Predicted −</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 bg-gray-100 p-2 font-semibold">Actual +</td>
            <td className="border border-gray-300 p-3 bg-green-50 text-center">
              <div className="font-bold text-green-700">{truePositive}</div>
              <div className="text-xs text-gray-600">TP ({getPercentage(truePositive)}%)</div>
            </td>
            <td className="border border-gray-300 p-3 bg-red-50 text-center">
              <div className="font-bold text-red-700">{falseNegative}</div>
              <div className="text-xs text-gray-600">FN ({getPercentage(falseNegative)}%)</div>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 bg-gray-100 p-2 font-semibold">Actual −</td>
            <td className="border border-gray-300 p-3 bg-red-50 text-center">
              <div className="font-bold text-red-700">{falsePositive}</div>
              <div className="text-xs text-gray-600">FP ({getPercentage(falsePositive)}%)</div>
            </td>
            <td className="border border-gray-300 p-3 bg-green-50 text-center">
              <div className="font-bold text-green-700">{trueNegative}</div>
              <div className="text-xs text-gray-600">TN ({getPercentage(trueNegative)}%)</div>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  )
}

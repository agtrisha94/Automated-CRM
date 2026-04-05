/**
 * LiveScoreTester Component
 * Ad-hoc feature input form for real-time scoring comparison
 */
import { useState } from 'react'
import { Button, Card, Badge } from '@/components/ui'
import { useScoring } from '@/hooks'

export function LiveScoreTester() {
  const { compareScores, isComparing, compareResult } = useScoring()

  const [features, setFeatures] = useState({
    emailOpens: 0,
    websiteVisits: 0,
    formFills: 0,
  })

  const handleInputChange = (field: string, value: number) => {
    setFeatures((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // For demo purposes, using a fake lead ID
    // In real usage, would pass actual lead ID from list
    await compareScores('demo-lead-123')
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Live Score Tester</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Opens</label>
          <input
            type="number"
            min="0"
            max="100"
            value={features.emailOpens}
            onChange={(e) => handleInputChange('emailOpens', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website Visits</label>
          <input
            type="number"
            min="0"
            max="100"
            value={features.websiteVisits}
            onChange={(e) => handleInputChange('websiteVisits', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Form Fills</label>
          <input
            type="number"
            min="0"
            max="100"
            value={features.formFills}
            onChange={(e) => handleInputChange('formFills', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isComparing} variant="primary" className="w-full">
        {isComparing ? 'Comparing...' : 'Run Comparison'}
      </Button>

      {compareResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Comparison Results</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Rule-Based Score:</span>
              <Badge variant="info">{compareResult.ruleScore}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">LR Score:</span>
              <Badge variant="info">{compareResult.lrScore}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">RF Score:</span>
              <Badge variant="info">{compareResult.rfScore}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Agreement:</span>
              <Badge variant={compareResult.agreement ? 'success' : 'warning'}>
                {compareResult.agreement ? 'Agree' : 'Disagree'}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

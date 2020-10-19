import * as core from '@actions/core'

import { isDoNotMergeLabel } from './helpers'
import { MergeMethod } from './types'

function getNumber(input: string, options?: core.InputOptions): number | null {
  const stringValue = core.getInput(input, options)

  if (!stringValue) {
    return null
  }

  const numberValue = parseInt(stringValue, 10)

  if (isNaN(numberValue)) {
    throw new Error(`Failed parsing input '${input}' to number: '${stringValue}'`)
  }

  return numberValue
}

function getArray(input: string, options?: core.InputOptions): string[] {
  const stringValue = core.getInput(input, options)

  return (stringValue || null)?.split(',') ?? []
}

export class Input {
  token: string
  mergeMethod: MergeMethod
  squashTitle: boolean
  doNotMergeLabels: string[]
  requiredLabels: string[]
  pullRequest: number | null
  dryRun: boolean

  constructor() {
    this.token = core.getInput('token', { required: true })

    const mergeMethod = core.getInput('merge-method') || undefined
    switch (mergeMethod) {
      case 'squash':
      case 'rebase':
      case 'merge':
      case undefined: {
        this.mergeMethod = mergeMethod
        break
      }
      default: {
        throw new Error(`Unknown merge method: '${mergeMethod}'`)
      }
    }

    this.squashTitle = core.getInput('squash-title') === 'true'

    this.doNotMergeLabels = getArray('do-not-merge-labels')
    this.requiredLabels = getArray('required-labels')

    for (const requiredLabel of this.requiredLabels) {
      if (this.doNotMergeLabels.includes(requiredLabel) || isDoNotMergeLabel(requiredLabel)) {
        throw new Error(`Cannot set a “do not merge” label as a required label.`)
      }
    }

    this.pullRequest = getNumber('pull-request')
    this.dryRun = core.getInput('dry-run') === 'true'
  }
}

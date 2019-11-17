import { Minimatch } from 'minimatch'
import template from 'lodash.template'

type StatementEffect = 'allow' | 'deny'
type StatementPattern = string

interface Condition {
  [key: string]: any
}

interface StatementConditions {
  [key: string]: Condition
}

export type StatementConfig = {
  effect?: StatementEffect
  resources: StatementPattern[]
  actions: StatementPattern[]
  conditions?: StatementConditions
}

//"Condition" : { "{condition-operator}" : { "{condition-key}" : "{condition-value}" }}
export class Statement {
  effect: StatementEffect
  private resources: StatementPattern[]
  private actions: StatementPattern[]
  private conditions: StatementConditions
  constructor({ effect = 'allow', resources, actions, conditions }: StatementConfig) {
    this.effect = effect
    this.resources = resources
    this.actions = actions
    this.conditions = conditions
  }

  matches(action: string, resource: string, context?: object, conditionResolvers?: object): boolean {
    if(conditionResolvers&&this.conditions&&context){
      return (
        this.actions.some(a =>
          new Minimatch(applyContext(a, context)).match(action)
        ) &&
        this.resources.some(r =>
          new Minimatch(applyContext(r, context)).match(resource)
        ) &&
        Object.keys(this.conditions).every(condition =>
          Object.keys(this.conditions[condition]).every(path=>
            conditionResolvers[condition](getValueFromPath(context,path),this.conditions[condition][path])
          )  
        )
      )
  }
    return (
      this.actions.some(a =>
        new Minimatch(applyContext(a, context)).match(action)
      ) &&
      this.resources.some(r =>
        new Minimatch(applyContext(r, context)).match(resource)
      )
    )
  }
}

export function getValueFromPath(data, path) {
  let value= data
  const steps = path.split('.');
  steps.forEach(e => value=value[e]);  
  return value
}

export function applyContext(str: string, context?: object) {
  if (context == null) return str
  const t = template(str)
  return t(context)
}

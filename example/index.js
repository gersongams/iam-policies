const {Role}=require('iam')

const role = new Role([
  {
    effect: 'allow', // optional, defaults to allow
    resources: ['secrets:${user.id}:*'],
    actions: ['read', 'write'],
  },
  {
    resources: ['secrets:{${user.bestfriends}}:*'],
    actions: ['read'],
  },
  {
    effect: 'deny',
    resources: ['secrets:admin:*'],
    actions: ['read'],
  },
])
 
const context = { user: { id: 456, bestfriends: [123, 563, 1211] } }

// true
console.log(role.can('read', 'secrets:563:sshhh', context))
// false
console.log(role.can('read', 'secrets:admin:super-secret', context))
 
const friendsWithAdminContext = { user: { id: 456, bestfriends: ['admin'] } }

// false
console.log(role.can('read', 'secrets:admin:super-secret', friendsWithAdminContext))

const adminRole = new Role([
  {
    resources: ['*'],
    actions: ['*'],
  },
])

// true
console.log(adminRole.can('read', 'someResource'))
// true
console.log(adminRole.can('write', 'otherResource'))

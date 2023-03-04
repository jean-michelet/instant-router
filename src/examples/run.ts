import RadixTreeRouter from "../RadixTreeRouter"

const router = new RadixTreeRouter()
router.addRouteNode({path: '/users/:userId/5', methods: "GET", controller: () => {}})
router.addRouteNode({path: '/users/profile/45', methods: "GET", controller: () => {}})

const node = router.find('/users/profile/45')
console.log(node);
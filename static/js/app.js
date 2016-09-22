Vue.config.delimiters = ["${", "}"];
new Vue({
    el: "#app",
    data: {
        bar: [],
        current: {},
        show: false,
        msg: ''
    },
    ready: function () {
        this.getKey()
    },
    methods: {
        select: function (key) {
            this.current.key = key
            this.getKey()
        },
        getKey: function () {
            var vm = this
            Vue.http.get('/keys', {params: vm.current}).then(function (res) {
                vm.current = res.body
                if (vm.current.key == null) {
                    vm.current.key = ''
                }
                var pieces = vm.current.key.split('/')
                vm.bar = []
                vm.bar.push({key: '/', full: ''})
                for (var i = 1; i < pieces.length; i++) {
                    vm.bar.push({key: pieces[i], full: pieces.slice(0, i + 1).join('/')})
                }
            })
        },
        setKey: function () {
            var vm = this
            Vue.http.put('/keys', vm.current).then(function (res) {
                vm.showMsg('success')
                vm.current.key = vm.current.key.split('/').slice(0,-1).join('/')
                vm.getKey()
            })
        },
        deleteKey: function () {
            var vm = this
            Vue.http.delete('/keys',  {params: vm.current}).then(function (res) {
                vm.showMsg('success')
                vm.current.key = vm.current.key.split('/').slice(0,-1).join('/')
                vm.getKey()
            })
        },
        showMsg: function () {
            var vm = this
            vm.show = true
            setInterval(function () {
                vm.show = false
            }, 2000)
        }
    }
})
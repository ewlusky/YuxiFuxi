import React, { Component } from 'react';

class Tesseract extends Component {
    state = {}

    componentDidMount() {
        var canvas = document.getElementById('logo-canvas'),
            ctx = canvas.getContext('2d'),
            color = "white"



        var gh = .12;


        function main(time) {
            // fixdim()
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            var t = time / 10000

            ctx.strokeStyle = ctx.fillStyle = color
            var sm = 1

            var m = tesseractwithrotation(t, t * 2, t * 3, mouse.x / 100, mouse.y / 100, 0)

            drawtesseract(ctx, m, {
                x: canvas.width / 2,
                y: canvas.height / 2,
                size: gh * canvas.height,
                line_width: 2,
            })

            var lasttime = time
            requestAnimationFrame(main)
        }



        requestAnimationFrame(function init(t) {
            var lasttime = t
            requestAnimationFrame(main)
        })


        function app1(p, a, c1, c2) {
            var l = Math.cos(a) * p[c1] + Math.sin(a) * p[c2]
            var k = -Math.sin(a) * p[c1] + Math.cos(a) * p[c2]
            p[c1] = l
            p[c2] = k
        }

        function app2(p, a, c1, c2) {
            var l = Math.cos(a) * p[c1] - Math.sin(a) * p[c2]
            var k = Math.sin(a) * p[c1] + Math.cos(a) * p[c2]
            p[c1] = l
            p[c2] = k
        }

        var _edges
        function tesseractedges() {
            if (!_edges) {
                var m = tesseractwithrotation(0, 0, 0, 0, 0, 0)
                var edges = []
                var indicies = ['x', 'y', 'z', 'w']
                for (var i = 0; i < m.length; i++) {
                    for (var j = i + 1; j < m.length; j++) {
                        var count = 0
                        for (var k = 0; k < 4; k++) {
                            if (m[i][indicies[k]] === m[j][indicies[k]]) count++
                        };
                        if (count === 3) edges.push([i, j])
                    }
                }
                _edges = edges
            }
            return _edges
        }

        function tesseractwithrotation(a, b, c, d, e, f) {
            var verticies = []
            for (var i = 0; i < 16; i++) {
                var p = {
                    x: (i & 1) * 2 - 1,
                    y: ((i >> 1) & 1) * 2 - 1,
                    z: ((i >> 2) & 1) * 2 - 1,
                    w: ((i >> 3) & 1) * 2 - 1
                }
                app1(p, a, 'x', 'y')
                app1(p, b, 'y', 'z')
                app1(p, c, 'x', 'w')
                app2(p, d, 'x', 'z')
                app2(p, e, 'y', 'w')
                app2(p, f, 'z', 'w')
                verticies.push(p)
            }
            return verticies
        }

        function project(point, size) {
            return {
                x: (point.x + Math.SQRT2 * point.z) * size,
                y: (point.y + Math.SQRT2 * point.w) * size
            }
        }

        function drawtesseract(ctx, tesseract, opts) {
            var edges = tesseractedges()
            for (var i = 0; i < tesseract.length; i++) {
                var proj = project(tesseract[i], opts.size)
                ctx.beginPath()
                ctx.arc(proj.x + opts.x, proj.y + opts.y, opts.corner_radius, 0, 2 * Math.PI)
                ctx.fill()
            };
            ctx.lineWidth = opts.line_width || 1
            ctx.beginPath()
            for (var i = 0; i < edges.length; i++) {
                var v1 = project(tesseract[edges[i][0]], opts.size),
                    v2 = project(tesseract[edges[i][1]], opts.size)
                ctx.moveTo(v1.x + opts.x, v1.y + opts.y)
                ctx.lineTo(v2.x + opts.x, v2.y + opts.y)
            };
            ctx.stroke()
        }
        var mouse = {
            x: 0,
            y: 0,
            direction: 0,

            start: {
                x: 0,
                y: 0
            },

            dragging: false,

            set: function (x, y) {
                mouse.x = x
                mouse.y = y
                mouse.direction = Math.atan2(y - mouse.start.y, x - mouse.start.x)
            },

            coords: function (e) {
                // e.preventDefault(); 
                if (e.pageX) {
                    mouse.set(e.pageX, e.pageY)
                }
                else if (e.offsetX) {
                    mouse.set(e.offsetX, e.offsetY)
                }
                else if (e.layerX) {
                    mouse.set(e.layerX, e.layerY)
                }
                else if (e.targetTouches && e.targetTouches.length > 0) {
                    mouse.set(e.targetTouches[0].pageX, e.targetTouches[0].pageY)
                }
            },

            down: function (e) {
                mouse.coords(e)
                mouse.start.x = mouse.x
                mouse.start.y = mouse.y
                mouse.dragging = true
                // console.log(e)

            },

            up: function (e) {
                mouse.coords(e)
                mouse.dragging = false
            }
        }

        document.addEventListener("touchstart", mouse.down, true);
        document.addEventListener("touchend", mouse.up, true);
        document.addEventListener("touchmove", mouse.coords, true);

        document.addEventListener("mousedown", mouse.down, true);
        document.addEventListener("mouseup", mouse.up, true);
        document.addEventListener("mousemove", mouse.coords, true);
    }

    render() {
        return (
            <a target="_blank" href="https://www.youtube.com/playlist?list=PLUopoMgYFRYnhkzcTxA7_wHqYb55BVRI4"><canvas id="logo-canvas"></canvas></a>
        );
    }
}

export default Tesseract;
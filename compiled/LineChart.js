var org;
(function (org) {
    var suh;
    (function (suh) {
        function identity(e) {
            return e;
        }
        suh.identity = identity;
        var LineChart = (function () {
            function LineChart(parentEl, config) {
                if (!d3) {
                    throw new Error('Could not find D3');
                }
                this.parentEl = parentEl;
                this._rendered = false;
                this._config = config || {
                    margins: { top: 0, left: 0, right: 0, bottom: 0 },
                };
                this.xScale = (config && config.xScaleCreator && config.xScaleCreator()) || d3.scale.linear();
                this.yScale = (config && config.yScaleCreator && config.yScaleCreator()) || d3.scale.linear();
                this.xAxis = (config && config.xAxisCreator && config.xAxisCreator()) || d3.svg.axis().scale(this.xScale).orient("left");
                this.yAxis = (config && config.yAxisCreator && config.yAxisCreator()) || d3.svg.axis().scale(this.yScale).orient("bottom");
                this.lineFn = d3.svg
                    .line()
                    .x(this.xScale)
                    .y(this.yScale);
            }
            LineChart.prototype.setData = function (data) {
                this._data = data;
                return this;
            };
            LineChart.prototype.update = function () {
            };
            LineChart.prototype.render = function () {
                var posConfig = this.parentEl.getBoundingClientRect(), cfg = this._config, height = cfg.height || posConfig.height, width = cfg.width || posConfig.width, margins = cfg.margins, xDomain = d3.extent(this._data, cfg.xAccessor || identity), xRange = [0, width - margins.left - margins.right], yDomain = d3.extent(this._data, cfg.yAccessor || identity), yRange = [height - margins.bottom, margins.top], xScale = this.xScale, yScale = this.yScale, updateSet;
                xScale.domain(xDomain)
                    .range(xRange);
                yScale.domain(yDomain)
                    .range(yRange);
                if (this._rendered) {
                    updateSet = this._canvas
                        .selectAll('path.data-line')
                        .data(this._data)
                        .attr('d', this.lineFn);
                    this.xAxisEl.call(this.xAxis);
                    this.yAxisEl.call(this.yAxis);
                }
                else {
                    this.el = d3.select(this.parentEl)
                        .append('svg')
                        .attr('width', posConfig.width)
                        .attr('height', posConfig.height);
                    this._canvas = this.el.append('g')
                        .attr('transform', 'translate(' + [margins.left, margins.top] + ')');
                    this.xAxisEl = this._canvas
                        .append('g')
                        .attr('class', 'x axis');
                    this.xAxisEl.call(this.xAxis);
                    this.yAxisEl = this._canvas
                        .append('g')
                        .attr('class', 'y axis');
                    this.yAxisEl.call(this.yAxis);
                    updateSet = this._canvas
                        .selectAll('path.data-line')
                        .data(this._data)
                        .attr('d', this.lineFn);
                    this._rendered = true;
                }
                updateSet.enter()
                    .append('path')
                    .attr('class', function (d, i, oi) {
                    return 'data-line ' + (cfg.lineClassFn && cfg.lineClassFn(d) || '');
                }).attr('d', this.lineFn);
                updateSet.exit()
                    .remove();
            };
            return LineChart;
        }());
        suh.LineChart = LineChart;
    })(suh || (suh = {}));
})(org || (org = {}));

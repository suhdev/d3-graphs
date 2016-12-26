namespace org{
    export namespace suh{
        interface BarChartConfig{
            height?:number;
            width?:number;
            margins:ChartMargins;
            categories:string[];
            legendLabels:string[];
            groupAccessor?:(e:any,i?:number)=>any;
            itemAccessor?:(e:any,i?:number)=>any;
            xAccessor?:(e:any,i?:number)=>any;
            yAccessor?:(e:any,i?:number)=>any;
            lineClassFn?:(e:any,i:number)=>string;
            yScaleCreator?:()=>any;
            xAxisCreator?:()=>any;
            yAxisCreator?:()=>any;
        }

        export class BarChart{
            parentEl:HTMLElement;
            el:d3.Selection<any>;
            _rendered:boolean;
            _config:BarChartConfig;
            _canvas:d3.Selection<any>;
            _data:any;
            _lines:d3.Selection<any>;
            groupScale:d3.scale.Ordinal<any,any>;
            xScale:d3.scale.Ordinal<any,any>;
            colorScale:d3.scale.Ordinal<any,any>;
            yScale:d3.scale.Identity|d3.scale.Linear<any,any>|
                d3.scale.Log<any,any>|d3.scale.Ordinal<any,any>|
                d3.scale.Pow<any,any>|d3.scale.Quantile<any>|
                d3.scale.Quantize<any>|d3.scale.Threshold<any,any>;
            xAxis:d3.svg.Axis;
            yAxis:d3.svg.Axis;
            xAxisEl:d3.Selection<any>;
            yAxisEl:d3.Selection<any>;
            lineFn:d3.svg.Line<any>;

            constructor(parentEl:HTMLElement,config?:BarChartConfig){
                if (!d3){
                    throw new Error('Could not find D3'); 
                }
                this.parentEl = parentEl;
                this._rendered = false; 
                this._config = config || {
                    margins:{top:0,left:0,right:0,bottom:0},
                    categories:[],
                    legendLabels:[]
                }; 
                let xAccessor = config.xAccessor || identity;
                let yAccessor = config.yAccessor || identity;
                let groupScale:any = this.groupScale = d3.scale.ordinal().rangeRoundBands([0, 100], .1);
                let xScale:any = this.xScale = d3.scale.ordinal();
                let colorScale:any = this.colorScale =  d3.scale.ordinal()
                    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
                let yScale:any = this.yScale = (config && config.yScaleCreator && config.yScaleCreator()) || d3.scale.linear();  
                this.xAxis = (config && config.xAxisCreator && config.xAxisCreator()) || d3.svg.axis().scale(this.groupScale).orient("bottom");
                this.yAxis = (config && config.yAxisCreator && config.yAxisCreator()) || d3.svg.axis().scale(this.yScale).orient("left");
                this.onResize = this.onResize.bind(this); 
                window.addEventListener('resize',this.onResize);
            }

            onResize(){
                this.render();
            }

            setData(data){
                this._data = data;
                return this;
            }

            update(){

            }

            render(){
                // let WW = jQuery(window).
                let posConfig = this.parentEl.getBoundingClientRect(),
                    cfg = this._config,
                    height = cfg.height || posConfig.height,
                    width = cfg.width || posConfig.width,
                    margins = cfg.margins,
                    canvasWidth = width - margins.left - margins.right,
                    canvasHeight = height - margins.top - margins.bottom,
                    xDomain = [d3.min(this._data,function(e:any){
                        return d3.min(e,cfg.xAccessor||identity);
                    }),d3.max(this._data,function(e:any){
                        return d3.max(e,cfg.xAccessor||identity);
                    })],
                    xRange = [0,width-margins.left-margins.right],
                    yDomain = [
                        d3.min(this._data,function(e:any){
                            return d3.min(e.countries,cfg.yAccessor||identity);
                        }),
                        d3.max(this._data,function(e:any){
                            return d3.max(e.countries,cfg.yAccessor||identity);
                        })],
                    yRange = [height-margins.bottom-margins.top,0],
                    groupAccessor = cfg.groupAccessor || identity,
                    itemAccessor = cfg.itemAccessor || identity,
                    xAccessor = cfg.xAccessor || identity,
                    yAccessor = cfg.yAccessor || identity,
                    colorScale = this.colorScale, 
                    groupScale = this.groupScale.rangeRoundBands([0, canvasWidth], .1),
                    xScale = this.xScale,
                    yScale = <d3.scale.Linear<any,any>>this.yScale,
                    updateSet; 
                console.log(yDomain);
                groupScale.domain(cfg.categories);
                console.log(cfg.legendLabels)
                xScale.domain(cfg.legendLabels)
                    .rangeRoundBands([0, groupScale.rangeBand()]);;
                yScale.domain(yDomain)
                    .range(yRange); 
                
       

  

//   state.selectAll("rect")
//       .data(function(d) { return d.ages; })
//     .enter().append("rect")
//       .attr("width", x1.rangeBand())
//       .attr("x", function(d) { return x1(d.name); })
//       .attr("y", function(d) { return y(d.value); })
//       .attr("height", function(d) { return height - y(d.value); })
//       .style("fill", function(d) { return color(d.name); });

//   var legend = svg.selectAll(".legend")
//       .data(ageNames.slice().reverse())
//     .enter().append("g")
//       .attr("class", "legend")
//       .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

//   legend.append("rect")
//       .attr("x", width - 18)
//       .attr("width", 18)
//       .attr("height", 18)
//       .style("fill", color);

//   legend.append("text")
//       .attr("x", width - 24)
//       .attr("y", 9)
//       .attr("dy", ".35em")
//       .style("text-anchor", "end")
//       .text(function(d) { return d; });

                if (!this._rendered){
                    this.el = d3.select(this.parentEl)
                        .append('svg')
                        .attr('width',posConfig.width)
                        .attr('height',posConfig.height); 
                    this._canvas = this.el.append('g')
                        .attr('transform','translate('+[margins.left,margins.top]+')');
                   
                    this.xAxisEl = this._canvas
                        .append('g')
                        .attr('class','x axis')
                        .attr('transform','translate('+[0,height-margins.bottom-margins.top]+')');
                     
                    this.yAxisEl = this._canvas
                        .append('g')
                        .attr('transform','translate('+[0,0]+')')
                        .attr('class','y axis'); 
                    this._rendered = true;
                }
                this.xAxisEl.call(this.xAxis);
                this.yAxisEl.call(this.yAxis);
                updateSet = this._canvas.selectAll(".data-group")
                        .data(this._data)
                        .attr("transform", function(d,i) { return "translate(" + groupScale(groupAccessor(d,i)) + ",0)"; });
                let rectsUpdateSet = updateSet.selectAll("rect")
                    .data(itemAccessor);
                rectsUpdateSet.attr("width", xScale.rangeBand())
                    .attr("x", function(d,i) { return xScale(xAccessor(d,i)) })
                    .attr("y", function(d,i) { return yScale(yAccessor(d,i)); })
                    .attr("height", function(d,i) { return canvasHeight - yScale(yAccessor(d,i)); })
                    .style("fill", function(d,i) { return colorScale(i); });
                rectsUpdateSet.exit()
                    .remove(); 
                rectsUpdateSet.enter()
                    .append("rect")
                    .attr("width", xScale.rangeBand())
                    .attr("x", function(d,i) { return xScale(xAccessor(d,i)); })
                    .attr("y", function(d,i) { return yScale(yAccessor(d,i)); })
                    .attr("height", function(d,i) { return canvasHeight - yScale(yAccessor(d,i)); })
                    .style("fill", function(d,i) { return colorScale(i); });
                
                this.el.attr('width',posConfig.width)
                    .attr('height',posConfig.height);
                let enterSet = updateSet.enter()
                    .append("g")
                    .attr("class", "data-group")
                    .attr("transform", function(d,i) { return "translate(" + groupScale(groupAccessor(d,i)) + ",0)"; });
                enterSet.selectAll("rect")
                    .data(itemAccessor)
                    .enter().append("rect")
                    .attr("width", xScale.rangeBand())
                    .attr("x", function(d,i) { console.log(xAccessor(d,i)); return xScale(xAccessor(d,i)); })
                    .attr("y", function(d,i) { return yScale(yAccessor(d,i)); })
                    .attr("height", function(d) { return canvasHeight - yScale(yAccessor(d)); })
                    .style("fill", function(d,i) { return colorScale(i); });
                updateSet.exit()
                    .remove();               

            }
        }
    }
}
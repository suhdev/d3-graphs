declare interface ChartMargins{
    left:number;
    top:number;
    bottom:number;
    right:number;
}
namespace org{
    export namespace suh{
        export function identity(e:any):any{
            return e;
        }
        interface LineChartConfig{
            height?:number;
            width?:number;
            margins:ChartMargins;
            xScaleCreator?:()=>d3.scale.Identity|d3.scale.Linear<any,any>|
                d3.scale.Log<any,any>|d3.scale.Ordinal<any,any>|
                d3.scale.Pow<any,any>|d3.scale.Quantile<any>|
                d3.scale.Quantize<any>|d3.scale.Threshold<any,any>;
            yScaleCreator?:()=>d3.scale.Identity|d3.scale.Linear<any,any>|
                d3.scale.Log<any,any>|d3.scale.Ordinal<any,any>|
                d3.scale.Pow<any,any>|d3.scale.Quantile<any>|
                d3.scale.Quantize<any>|d3.scale.Threshold<any,any>;
            xAxisCreator?:()=>d3.svg.Axis;
            yAxisCreator?:()=>d3.svg.Axis;
            xAccessor?:(e:any,i?:number)=>any;
            yAccessor?:(e:any,i?:number)=>any;
            lineClassFn?:(e:any,i:number)=>string;
        }

        export class LineChart{
            parentEl:HTMLElement;
            el:d3.Selection<any>;
            _rendered:boolean;
            _config:LineChartConfig;
            _canvas:d3.Selection<any>;
            _data:any;
            _lines:d3.Selection<any>;
            xScale:d3.scale.Identity|d3.scale.Linear<any,any>|
                d3.scale.Log<any,any>|d3.scale.Ordinal<any,any>|
                d3.scale.Pow<any,any>|d3.scale.Quantile<any>|
                d3.scale.Quantize<any>|d3.scale.Threshold<any,any>;
            yScale:d3.scale.Identity|d3.scale.Linear<any,any>|
                d3.scale.Log<any,any>|d3.scale.Ordinal<any,any>|
                d3.scale.Pow<any,any>|d3.scale.Quantile<any>|
                d3.scale.Quantize<any>|d3.scale.Threshold<any,any>;
            xAxis:d3.svg.Axis;
            yAxis:d3.svg.Axis;
            xAxisEl:d3.Selection<any>;
            yAxisEl:d3.Selection<any>;
            lineFn:d3.svg.Line<any>;

            constructor(parentEl:HTMLElement,config?:LineChartConfig){
                if (!d3){
                    throw new Error('Could not find D3'); 
                }
                this.parentEl = parentEl;
                this._rendered = false; 
                this._config = config || {
                    margins:{top:0,left:0,right:0,bottom:0},
                }; 
                let xAccessor = config.xAccessor || identity;
                let yAccessor = config.yAccessor || identity;
                let xScale:any = this.xScale = (config && config.xScaleCreator && config.xScaleCreator()) || d3.scale.linear();
                let yScale:any = this.yScale = (config && config.yScaleCreator && config.yScaleCreator()) || d3.scale.linear();  
                this.xAxis = (config && config.xAxisCreator && config.xAxisCreator()) || d3.svg.axis().scale(this.xScale).orient("bottom"); 
                this.yAxis = (config && config.yAxisCreator && config.yAxisCreator()) || d3.svg.axis().scale(this.yScale).orient("left");
                this.onResize = this.onResize.bind(this); 
                window.addEventListener('resize',this.onResize);
                this.lineFn = d3.svg
                    .line()
                    .defined(function(d:any,i:number) { return xAccessor(d,i); })
                    .x(function(e,i){
                        return xScale(xAccessor(e,i));
                    })
                    .y(function(e,i){
                        return yScale(yAccessor(e));
                    })
                    .interpolate("basis"); 
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
                let posConfig = this.parentEl.getBoundingClientRect(),
                    cfg = this._config,
                    height = cfg.height || posConfig.height,
                    width = cfg.width || posConfig.width,
                    margins = cfg.margins,
                    xDomain = [d3.min(this._data,function(e:any){
                        return d3.min(e,cfg.xAccessor||identity);
                    }),d3.max(this._data,function(e:any){
                        return d3.max(e,cfg.xAccessor||identity);
                    })],
                    xRange = [0,width-margins.left-margins.right],
                    yDomain = [
                        d3.min(this._data,function(e:any){
                            return d3.min(e,cfg.yAccessor||identity);
                        }),
                        d3.max(this._data,function(e:any){
                            return d3.max(e,cfg.yAccessor||identity);
                        })],
                    yRange = [height-margins.bottom-margins.top,0],
                    xScale = <d3.scale.Linear<any,any>>this.xScale,
                    yScale = <d3.scale.Linear<any,any>>this.yScale,
                    updateSet; 
                xScale.domain(xDomain)
                    .range(xRange);
                yScale.domain(yDomain)
                    .range(yRange); 
                if (this._rendered){
                    updateSet = this._canvas
                        .selectAll('path.data-line')
                        .data(this._data)
                        .attr('d',this.lineFn);
                    this.xAxisEl.call(this.xAxis);
                    this.yAxisEl.call(this.yAxis);
                    
                }else{
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
                    this.xAxisEl.call(this.xAxis); 
                    this.yAxisEl = this._canvas
                        .append('g')
                        .attr('transform','translate('+[0,0]+')')
                        .attr('class','y axis'); 
                    this.yAxisEl.call(this.yAxis); 
                    updateSet = this._canvas
                        .selectAll('path.data-line')
                        .data(this._data);
                    updateSet.attr('d',this.lineFn);
                    this._rendered = true;
                }
                this.el.attr('width',posConfig.width)
                    .attr('height',posConfig.height);
                updateSet.enter()
                    .append('path')
                    .attr('class',function(d,i,oi){
                        return 'data-line '+((cfg.lineClassFn && cfg.lineClassFn(d,i))|| ''); 
                    })
                    .attr('d',this.lineFn);
                updateSet.exit()
                    .remove();               

            }
        }
    }
}
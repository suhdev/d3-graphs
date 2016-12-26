namespace org{
    export namespace suh{

        
       
        interface PieChartConfig{
            height?:number;
            width?:number;
            margins:ChartMargins;
            colors:string[];
            valueAccessor?:(e:any,i:number)=>any;
            colorAccessor?:(e:any,i:number)=>any;
            lineClassFn?:(e:any,i:number)=>string;
        }

        export class DonutChart{
            parentEl:HTMLElement;
            colorScale:d3.scale.Ordinal<any,any>;
            pieLayout:d3.layout.Pie<any>;
            el:d3.Selection<any>;
            _rendered:boolean;
            _config:PieChartConfig;
            _canvas:d3.Selection<any>;
            _data:any;
            arcFn:d3.svg.Arc<any>;

            constructor(parentEl:HTMLElement,config?:PieChartConfig){
                if (!d3){
                    throw new Error('Could not find D3'); 
                }
                this.parentEl = parentEl;
                this._rendered = false; 
                this._config = config || {
                    margins:{top:0,left:0,right:0,bottom:0},
                    colors:["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
                }; 
                let colorScale = this.colorScale = d3.scale.ordinal().range(config.colors); 
                this.onResize = this.onResize.bind(this); 
                window.addEventListener('resize',this.onResize);
                this.arcFn = d3.svg.arc();
                this.pieLayout = d3.layout.pie()
                    .sort(null)
                    .value(config.valueAccessor || org.suh.identity); 
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
                    colorScale = this.colorScale,
                    margins = cfg.margins,
                    radius = d3.min([height-margins.top-margins.bottom,width-margins.left-margins.right])/2,
                    updateSet;  
                this.arcFn.outerRadius(radius-10)
                    .innerRadius(radius-70);
                if (this._rendered){
                    this.el.attr('width',posConfig.width)
                        .attr('height',posConfig.height);
                    
                }else{
                    this.el = d3.select(this.parentEl)
                        .append('svg')
                        .attr('width',posConfig.width)
                        .attr('height',posConfig.height); 
                    this._canvas = this.el.append('g')
                        .attr('transform','translate('+[width/2,height/2]+')');
                   
                    updateSet = this._canvas
                        .selectAll('g.arc')
                        .data(this.pieLayout(this._data));
                    this._rendered = true;
                }
                
                let groups = updateSet.enter()
                    .append('g')
                    .attr('class',function(d,i,oi){
                        return 'data-arc '+((cfg.lineClassFn && cfg.lineClassFn(d,i))|| ''); 
                    });
                groups.append('path')
                    .style('fill',function(d,i){
                        return colorScale(i);
                    })
                    .attr('d',this.arcFn);
                updateSet.exit()
                    .remove();               

            }
        }
    }
}
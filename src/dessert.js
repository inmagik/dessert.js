(function() {
  var DessertJS = (function() {
    var ns = {
      
      getClassByString : function(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.');
        while (a.length) {
            var n = a.shift();
            if (n in o) {
                o = o[n];
            } else {
                return;
            }
        }
        return o;
      },

      isArray : function(x){
        return( Object.prototype.toString.call( x ) === '[object Array]' )
      },

      isObject : function(x){
        return( Object.prototype.toString.call( x ) === '[object Object]' )
      },

      construct : function(constructor, args) {
        var self=this;
        function F() {
          if(self.isArray(args)) return constructor.apply(this, args);    
          return constructor.apply(this,[ args ]);
        }
        F.prototype = constructor.prototype;
        return new F();
      },

      callFun :function(f, args){
        if(self.isArray(args)) return f.apply(this, args);    
        return f.apply(this,[ args ]);
      },

      fromConfigObject : function(o){

        var self = this;
        if(o instanceof Function){
          return o;
        }

        if(self.isArray(o)){
          var outArr = [];
          for(var i=0,n=o.length;i<n;i++){
            outArr.push(fromConfigObject(o[i]));
          }
          return outArr;
        }   

        if(self.isObject(o)){
          var outObj = {};
          for(var key in o){
            if(o.hasOwnProperty(key)){
              
              var lowerKey = key.lower();
              if(lowerKey.indexOf('construct:') == 0){
                key = key.replace('construct:', '');
                var kls = self.getClassByString(window, key);
                if(!kls){
                  throw { name : 'ConstructorNotFound', message : key}
                }
                var opts = self.fromConfigObject(o[key]);
                var outKls = self.construct(kls,opts);
                return outKls;
              
              } else if(lowerKey.indexOf('call:') == 0){
                  key = key.replace('call:', '');
                  var outFun  = self.getClassByString(window, key);
                  if(!outFun){
                    throw { name : 'FunctionNotFound', message : key}
                  }
                  var opts = self.fromConfigObject(o[key]);
                  var outVal = self.callFun(outFun, opts);
                  return outVal;

              } else{
                  outObj[key] = fromConfigObject(o[key]);    
              }
            }
            
          }
          return outObj;
        }
        
        return o;

      }

    };


    return ns;
  
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DessertJS;
  else
    window.DessertJS = DessertJS;
})();
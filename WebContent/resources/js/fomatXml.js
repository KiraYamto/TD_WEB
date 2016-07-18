var zFormat={
		formatJson:function(value){
			var result = JSON.stringify(JSON.parse(value), null, "\t");
			return result;
		},formatXml:function(value){
			var result = formatXml(value);
			return result;
		},format:function(value){
			var result;
			try{
				result=this.formatJson(value);
			}catch(e){
				result=this.formatXml(value);
			}
			return result;
		}
}


	function formatString(text){
		var result;
		try {
			result = JSON.stringify(JSON.parse(data), null, "\t");
			
		} catch (e) { 
			result=formatXml(text)
		}
		return result;
	}

    function formatXml(text)
    {
        //去掉多余的空格    	
        text = '\n' + text.replace(/(<\w+)(\s.*?>)/g,function($0, name, props)
        {
            return name + ' ' + props.replace(/\s+(\w+=)/g," $1");
        }).replace(/>\s*?</g,">\n<");

        //把注释编码
        text = text.replace(/\n/g,'\r').replace(/<!--(.+?)-->/g,function($0, text)
        {
            var ret = '<!--' + escape(text) + '-->';
            //alert(ret);
            return ret;
        }).replace(/\r/g,'\n');

        //调整格式
        var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
        var nodeStack = [];
        var output = text.replace(rgx,function($0,all,name,isBegin,isCloseFull1,isCloseFull2 ,isFull1,isFull2){
            var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/' ) || (isFull1 == '/') || (isFull2 == '/');
            //alert([all,isClosed].join('='));
            var prefix = '';
            if(isBegin == '!')
            {
                prefix = getPrefix(nodeStack.length);
            }
            else 
            {
                if(isBegin != '/')
                {
                    prefix = getPrefix(nodeStack.length);
                    if(!isClosed)
                    {
                        nodeStack.push(name);
                    }
                }
                else
                {
                    nodeStack.pop();
                    prefix = getPrefix(nodeStack.length);
                }

            }
                var ret =  '\n' + prefix + all;
                return ret;
        });

        var prefixSpace = -1;
        var outputText = output.substring(1);
        //alert(outputText);

        //把注释还原并解码，调格式
        outputText = outputText.replace(/\n/g,'\r').replace(/(\s*)<!--(.+?)-->/g,function($0, prefix,  text)
        {
            //alert(['[',prefix,']=',prefix.length].join(''));
            if(prefix.charAt(0) == '\r')
                prefix = prefix.substring(1);
            text = unescape(text).replace(/\r/g,'\n');
            var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix ) + '-->';
            //alert(ret);
            return ret;
        });

        return outputText.replace(/\s+$/g,'').replace(/\r/g,'\r\n');
    }
    
    function getPrefix(prefixIndex)
    {
        var span = '    ';
        var output = [];
        for(var i = 0 ; i < prefixIndex; ++i)
        {
            output.push(span);
        }

        return output.join('');
    }  
    
    
  //把报文格式从<></>转换成</>
    function selfClosingTagXml(str){
    	var offset = 0;
    	while (str.indexOf('></',offset) != -1){
    		
    		var i = str.indexOf('></',offset);
    		
    		var leftStart = i;
    		while (str.charAt(leftStart) != '<'){
    			leftStart--;
    		}
    		leftStart++;
    		
    		var leftEnd = leftStart+1;
    		while (str.charAt(leftEnd) != '>' && str.charAt(leftEnd) != ' '){
    			leftEnd++;
    		}
    	
    		var rightEnd = i + 1;
    		while (str.charAt(rightEnd) != '>'){
    			rightEnd++;
    		}
    	
    		leftTag = str.slice(leftStart,leftEnd).trim();
    		rightTag = str.slice(i+3,rightEnd).trim();
    	
    		if (leftTag == rightTag){
    			str = str.slice(0,i) + '/>' + str.slice(rightEnd+1);
    		}
    		offset = i + 3;
    	}
    	return str;
    }
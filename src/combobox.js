/*-------------------------------------------------------
 * combobox.js
 * date: 2017-10-08
 * author: Q
 * powered by wayixia.com
---------------------------------------------------------*/


Q.ComboBox = Q.extend( {
	hwnd : null,
	editWnd : null,
	arrowWnd: null,
	dropWnd : null,
	parent : null,
	overitem : -1,
	command : '',
	text : '',
	textList : [],	// 下拉窗口列表数据
	textListTemp : [],
	__init__ : function( json ) {
		var self = this;
    json = json || {};
		// 初始化数据
		this.textList = json.data;

    this.parent = json.parent;
		// 主窗口
		this.hwnd = document.createElement('div');
		this.parent.appendChild(this.hwnd);
		
		this.hwnd.className = json.wstyle || 'q-combobox';
		this.hwnd.IsMouseOver = false;
		Q.addEvent( this.hwnd, 'mouseover', function(){self.hwnd.IsMouseOver = true;});
		Q.addEvent( this.hwnd, 'mouseout', function(){self.hwnd.IsMouseOver = false;});

		// 编辑窗口
		this.editWnd = document.createElement('input');
		this.hwnd.appendChild(this.editWnd);
		this.editWnd.className = 'q-combobox-editwnd';
		Q.addEvent( this.editWnd, 'keyup',function(){
			if( event.keyCode != 13) 
				self.autoComplete();
			if( event.keyCode == 38) {	// up key
				self.up();
			} else if( event.keyCode == 40 ) {	// down key
				self.down();
			} else if( event.keyCode == 13 ) {
				self.msgbox('this.overitem :' + self.overitem)
				if( self.overitem > -1 ) {
					if( self.overitem >= self.textListTemp.length)
						return;
					self.dropWnd.childNodes[self.overitem].click();
					self.overitem = -1;
				}
			}
		});
		Q.addEvent( document.body, 'mouseup', function() {
			//alert('window.onmouseup')
			if(!self.hwnd.IsMouseOver ) {
				self.dropWindow(false);
			}
		} );
		
		this.arrowWnd = document.createElement('div');
		this.hwnd.appendChild(this.arrowWnd)
		
		this.arrowWnd.innerHTML = '<font face="Webdings">6</font>';
		this.arrowWnd.className = 'q-combobox-arrowwnd';
		Q.addEvent( this.arrowWnd, 'mouseup', function() {
			self.dropWindow( (self.dropWnd.style.display == '') ? false : true );
			self.editWnd.focus();
		});

		// 下拉窗口
    this.dropWnd = document.createElement('ul');
		document.body.appendChild(this.dropWnd);
		
		this.dropWnd.className = 'q-combobox-dropwnd';
		this.dropWnd.style.display = 'none';
		this.dropWnd.onmouseout = function() {
		    self.overitem = -1;
		}
		
		this.textListTemp = this.textList;
		this.textListTemp.sort();
	},
	
	push: function(item) {	//追加记录
		this.textList.push(item);
	},
	
	pushArray : function(arr) {
		for( var i=0; i < arr.length; i++) {
			this.textList.push(arr[i]);
		}
	},
	
	flush : function() {
		this.textList = [];
	},
	
	setWndText : function(text) {
		for(var i=0; i < this.textList.length; i++) {
			if( this.textList[i] == text ) {
				this.text = text;
				this.updateData();
			}
		}
		
	},
	
	getItemText : function() {
		
	},
	
	updateData : function() {
		if( this.hwnd != null ) {
			this.editWnd.value = this.text;
		}
	},
	
	updateDropWnd : function() {
		var self = this;
		this.textListTemp.sort();
		this.dropWnd.innerHTML = '';
		for( var i=0; i < this.textListTemp.length; i++ ) {
			var li = document.createElement('li');
			this.dropWnd.appendChild(li);
			li.className = 'q-combobox-itemout';
			li.href = 'javascript: void(0);'
			li.innerText = this.textListTemp[i];
			li.onmouseover = function() {
				self.overitem =  self.findItem(this);
				this.className = 'q-combobox-itemover';

			};
			li.onmouseout = function() {
				this.className = 'q-combobox-itemout';
			}
			li.onclick = function(){ 
        self.setWndText(this.innerText);
        self.dropWindow(false);
      }
			
		}
	},
	
	dropWindow : function(isDrop) {
		
		if( !isDrop ) {
			this.dropWnd.style.display = 'none';
			this.overitem = -1;
		} else {
			this.updateDropWnd();
			
			var pos = this.getAbsPosition();
			with( this.dropWnd.style) {
				left   = pos.left;
				top    = pos.height + pos.top + 1;
				width  = pos.width;
				display = '';
			}
		}
	},
	
	bind : function(id) {
		this.hwnd = $(id);
	},
	
	getAbsPosition : function(){
		var e = this.hwnd;
		var _x = e.offsetLeft;
		var _y = e.offsetTop;
		var _w = e.offsetWidth;
		var _h = e.offsetHeight-2;
		while(e=e.offsetParent) {
			_x += e.offsetLeft;
			_y += e.offsetTop;
		}
		return{
			width:_w,
			height:_h,
			top: _y,
			left: _x
		};
	},
	
	findItem : function(node) {
		var childNodes = this.dropWnd.childNodes;
		if( childNodes.length < 1 )
			return -1;
		for( var i=0; i < childNodes.length; i++ ) {
			if( childNodes[i] == node )
				return i;		
		}
		return -1;
	},
	
	onItemClick : function(lpfunc) {
		
	},
	
	autoComplete : function() {
		var text = this.editWnd.value;
		var count = 0;
		this.textListTemp = [];

		for( var i=0; i < this.textList.length; i++ ) {
			// alert(this.textList[i].substr(0, text.length)+":"+text);
			if( (text == this.textList[i].substr(0, text.length)) || text == '' ) {
				this.textListTemp.push(this.textList[i]);
				count = count + 1;
			}
		}
		if( count > 0 ) {
			this.dropWindow(true);
		} else {
			this.dropWindow(false);
		}
	},
	
	down : function() {
		// doNext;
		if(this.dropWnd.childNodes.length < 1) {
		    this.msgbox("no item", "green");
		    return;
		}
		this.msgbox("doNext start-----------------------------------");
		var node = null;
		var pos = -1;
		this.msgbox("init status: this.overitem :" + this.overitem )
		if( this.overitem <= -1 ) {
			this.msgbox("this overitem is null ");
			pos = 0;
		} else {
		    this.msgbox("this.overitem:  - " + this.overitem );
		    pos = this.mod((this.overitem + 1), this.textListTemp.length);
		}
		node = this.dropWnd.childNodes[pos];
		if( node != null ) {
		  this.msgbox("node: " + node.innerText);
			Q.fireEvent( node, 'mouseover' );
			this.overitem = pos;
		} else {
		    this.msgbox("node is null")
		}
		//this.msgbox("this.overitem: " + this.overitem.innerText);
		this.msgbox("doNext end--------------------------------------<br><br>");
	},
	
	up : function(){
		// do preview
		if(this.dropWnd.childNodes.length < 1) {
		    return;
		}
		var node = null;
		var pos = -1;
		this.msgbox("init status: this.overitem :" + this.overitem )
		if( this.overitem <= -1 ) {
			pos = this.mod(-1, this.textListTemp.length);
		} else {
		    pos = this.mod((this.overitem - 1), this.textListTemp.length);
		}
		node = this.dropWnd.childNodes[pos];
		if( node != null ) {
			Q.fireEvent( node, 'mouseover');
			this.overitem = this.mod(pos, this.textListTemp.length );
		} else {
		    this.msgbox("node is null")
		}
		this.msgbox("doNext end--------------------------------------<br><br>");	},
	
	msgbox : function(str, color) {
	    /*
	    if(color)
	        prop.innerHTML += "<br><font color='" + color + "'>" + str + "</font>";
	    else
	        prop.innerHTML += "<br>" + str;
	       */
	    
	},
	
	mod : function(num, modern) {
		var r = (num % modern);
		return ((r >= 0)? r:(r+modern));
	}
} );

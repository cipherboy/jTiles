/**
 * jTiles v0.7 - A HTML5 Tile layout with jQuery UI flipping library
 * Depends: jQuery, jQuery UI
 *
 * Copyright (C) 2012, 2013 Alex Scheel
 * All rights reserved.
 * Licensed under BSD 2 Clause License:
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
**/

/**
 * Usage:
 *   var tiles = new jTiles();
 *   tiles.init('container-element');
 *   tiles.addElement('<div class="huge">Front side</div>', '<div class="small">Back Side</div>', 'http://example.com/some/url.html');
 *   tiles.load();
 * 
 * API:
 *   Main:
 *     init(element_id) - initializes jTiles
 *     
 *     load() - loads jTiles, starts
 *     
 *     addElement(front, back, uri) - adds tile
 *     
 *     addBind(function) - Function to execute on bind
 *     
 *     addUnbind(function) - Function to execute on unbind
 *   
 *   Internal:
 *     genContent()
 *     
 *     processQueue(id)
 *     
 *     checkLoop()
 *     
 *     display()
 *     
 *     bindEvents()
 *     
 *     unbindEvents()
**/

function jTiles() {
    this.telement = '';
    this.elements = [];
    this.bindHandler = function() {};
    this.unbindHandler = function() {};
    this.queue = [];
    this.processing = false;
   
    this.init = function(telement) {
        this.telement = telement;
    }
   
    this.addElement = function(side1, side2, link) {
        this.elements.push([side1, side2, link]);
    }
   
    this.addBind = function(bind) {
        this.bindHandler = bind;
    }
   
    this.addUnbind = function(unbind) {
        this.unbindHandler = unbind;
    }
   
    this.genContent = function() {
        var result = "";
        for (var pos in this.elements) {
            var element = this.elements[pos];
            result += '<section id="' + this.telement + '-container-' + pos + '" class="jTilesContainer"><div id="' + this.telement + '-square-' + pos + '" class="jTilesSquare"><div id="' + this.telement + '-square-' + pos + '-side-1" class="jTilesSide1">' + element[0] + '</div><div id="' + this.telement + '-square-' + pos + '-side-2" class="jTilesSide2">' + element[1] + '</div></div></section>';
        }
       
        return result;
    }
    
    this.processQueue = function(id) {
        if (((this.processing == false) || (this.processing == id)) && (this.queue.length > 0)) {
            this.processing = id;
            
            if (this.queue.length > 0) {
                var item = this.queue.shift();
                
                if (item[0] == "show") {
                    var pos = item[1];
                    var telement = this.telement;
                    var dis = this;
                    
                    if ($('#' + this.telement + '-square-' + pos).is(':hover')) {
                        if ($('#' + this.telement + '-square-' + pos + '-side-1').is(':visible')) {
                            $('#' + this.telement + '-square-' + pos + '-side-1').hide('clip', 300, function() {
                                $('#' + telement + '-square-' + pos + '-side-2').show('clip', 300);
                            });
                        } else {
                        }
                    } else {
                    }
                    dis.processQueue(id);
                } else if (item[0] == "hide") {
                    var pos = item[1];
                    var telement = this.telement;
                    
                    if ($('#' + this.telement + '-square-' + pos + '-side-2').is(':visible')) {
                        $('#' + this.telement + '-square-' + pos + '-side-2').hide('clip', 300, function() {
                            $('#' + telement + '-square-' + pos + '-side-1').show('clip', 300);
                        });
                    }
                    this.processQueue(id);
                }
            } else {
                this.processing = false;
            }
        } else {
            if (this.queue.length == 0) {
                this.processing = false;
            }
        }
    }
    
    this.checkLoop = function() {
        for (var pos in this.elements) {
            if ($('#' + this.telement + '-square-' + pos + '-side-2').is(':visible')) {
                if (!$('#' + this.telement + '-square-' + pos).is(':hover')) {
                    this.queue.push(['hide', pos]);
                    
                    this.processQueue(Math.random());
                }
            }
        }
        
        var dis = this;
        setTimeout(function() { dis.checkLoop() }, 500);
    }
   
    this.display = function() {
        var content = this.genContent();
        $('#' + this.telement).html(content);
    }
   
    this.bindEvents = function() {
        this.unbindEvents();
        
        for (var pos in this.elements) {
            $(document).on('mouseenter', '#' + this.telement + '-square-' + pos, { instance: this, pos: pos }, function(event) {
                for (var pos in event.data.instance.elements) {
                    if (pos != event.data.pos) {
                        event.data.instance.queue.push(["hide", pos]);
                    }
                }
                event.data.instance.queue.push(["show", event.data.pos]);
                
                event.data.instance.processQueue(Math.random());
            });
            
            $(document).on('mouseleave', '#' + this.telement + '-square-' + pos, { instance: this, pos: pos }, function(event) {
                for (var pos in event.data.instance.elements) {
                    event.data.instance.queue.push(["hide", pos])
                }
                
                event.data.instance.processQueue(Math.random());
            });
            
            $(document).on('click', '#' + this.telement + '-square-' + pos, { instance: this, pos: pos }, function(event) {
                event.data.instance.unbindEvents();
                location.href = event.data.instance.elements[pos][2];
            });
        }
            
        $(document).off('mouseleave', '#' + this.telements, { instance: this, pos: pos }, function(event) {
            for (var pos in event.data.instance.elements) {
                event.data.instance.queue.push(["hide", pos])
            }
            
            event.data.instance.processQueue(Math.random());
        });
        
        this.bindHandler();
    }
   
    this.unbindEvents = function() {
        for (var pos in this.elements) {
            $(document).off('mouseenter', '#' + this.telement + '-square-' + pos);
            $(document).off('mouseleave', '#' + this.telement + '-square-' + pos);
            $(document).off('click', '#' + this.telement + '-square-' + pos);
        }
            
        $(document).off('mouseleave', '#' + this.telement);
        
        this.unbindHandler();
    }
   
    this.load = function() {
        $('#' + this.telement).hide(0);
        this.display();
        this.bindEvents();
        this.checkLoop();
        $('#' + this.telement).show(0);
    }
}

/**
 * Created by Administrator on 2017/12/8 0008.
 */

    /**
     * 属性面板管理器
     * @param options
     * {
     *   div - 属性面板div
     *   scene - viewer.scene
     *   graphicObjectHandler - 标绘Handler
     * }
     * @constructor
     * @example
     */
    var StylePanel = function(div,plotEditControl,plotting) {
        var _self = this;
        this._div = div;
        this._plottingEdit = plotEditControl;
        this._plotting = plotting;
        this._selectedFeature = undefined;
        this._group = ["基本", "衬线", "军标大小", "线型", "填充", "文本", "子标号",  "箭头类型", "缩放比例", "旋转角度", "图片大小"];
        this._displayName = ["镜像", "标号级别", "点标号显示模式", "模型路径", "图片路径", "整体高度", "Width", "Height", "x", "y", "z", "拉伸高度", "模型缩放","矢量缩放"];
        this._displayLineStyleName = ["线宽", "边线颜色", "线型"];
        this._displayFillStyleName = ["背景色", "背景透明", "渐变填充角度", "渐变填充模式", "渐变填充竖直偏移", "渐变填充水平偏移", "前景色", "填充模式", "填充透明度"];
        this._displayTextContentName = ["注记内容", "注记位置", "字体背景颜色", "注记大小", "注记字体", "注记颜色", "字体边框", "边框宽度", "边框颜色"];
        this._displaySurroundLineName = ["衬线类型", "衬线宽", "衬线颜色", "衬线透明度"];
		this._displayPositionName = ["经度", "纬度", "高度"];
        this.init();
        // 标号被选中回调函数
        this._plottingEdit.SelectedEvent.addEventListener(function(geoGraphicObject) {
            _self._selectedFeature = geoGraphicObject;
            var rows = _self.collectionPropertyGridRows(_self._selectedFeature);
            $('#pg').propertygrid('loadData', rows);
        });

        // 选中标号被释放回调函数
        this._plottingEdit.UnSelectedEvent.addEventListener(function() {
            _self._selectedFeature = undefined;
            var rows = _self.collectionPropertyGridRows(_self._selectedFeature);
            $('#pg').propertygrid('loadData', rows);
        });

        this._plottingEdit.ModifiedEvent.addEventListener(function (geoGraphicObject) {
            _self._selectedFeature = geoGraphicObject;
            var rows = _self.collectionPropertyGridRows(_self._selectedFeature);
            $('#pg').propertygrid('loadData', rows);

        });

        this._plottingEdit.RemoveFeatureEvent.addEventListener(function() {
            _self._selectedFeature = undefined;
            var rows = _self.collectionPropertyGridRows(_self._selectedFeature);
            $('#pg').propertygrid('loadData', rows);
        });

    };




    /**
     * @private
     * @function init
     * @description 初始化属性面板
     */
    StylePanel.prototype.init = function() {

        var _self = this;

        function afterModifySelectFeature() {
            var updated = $('#pg').propertygrid('getChanges', "updated");
            if (updated.length !== 0) {
                _self.updateSelectFeature(updated[0], _self._selectedFeature);
            }
            var rows = _self.collectionPropertyGridRows(_self._selectedFeature);
            $('#pg').propertygrid('loadData', rows);
        }

        var stylePanel = document.getElementById(_self._div);
        var propertygrid = document.createElement('table');
        propertygrid.id = "pg";
        propertygrid.className = "easyui-propertygrid";
        stylePanel.appendChild(propertygrid);

        $('#pg').propertygrid({
            showGroup:true,
            columns : [[
                { field : 'name', title: 'Name', width: 100, resizable: true },
                { field : 'value', title: 'Value', width: 100, resizable: true }
            ]],
            onAfterEdit : afterModifySelectFeature
        });
    };

    /**
     * @param graphicObject
     * @returns {Array}
     */
    StylePanel.prototype.collectionPropertyGridRows = function(graphicObject) {

        if (null === graphicObject || undefined === graphicObject || graphicObject.symbolName === "GroupObject") {
            return [];
        }

        var rows = [];
        if (null !== graphicObject && undefined !== graphicObject) {
            rows = [
                {"name": "标号ID", "value": graphicObject.id, "group": "标号"},
                {"name": "标号库ID", "value": graphicObject.libID, "group": "标号"},
                {"name": "标号code", "value": graphicObject.code, "group": "标号"},
                {"name": "标号名字", "value": graphicObject.symbolName, "group": "标号"}
            ];

            var annotationRows = this.getAnnotationRows(graphicObject);
            var symbolRankRows = this.getSymbolRankRows(graphicObject);
            var surroundLineTypeRows = this.getSurroundLineTypeRows(graphicObject);
            var dotShowModeRows = this.getDotShowModeRows(graphicObject);
            var fillSymbolIDRows = this.getFillSymbolIDRows(graphicObject);
            var fillGradientRows = this.getFillGradientModeRows(graphicObject);
            var lineStyleRows = this.getLineStyleRows(graphicObject);
            var subSymbolsTypeRows = this.getSubSymbolsTypeRows(graphicObject);


            // 镜像
            var dotSymbolNegativeImageObj = new Object();
            dotSymbolNegativeImageObj.name = this._displayName[0];
            dotSymbolNegativeImageObj.value = this.checkboxValueToString(this._selectedFeature.isNegativeImage);
            dotSymbolNegativeImageObj.group = this._group[0];
            dotSymbolNegativeImageObj.editor = {"type": 'checkbox', "options": {"on": true, "off": false}};

            // 标号级别
            var dotSymbolRankObj = new Object();
            dotSymbolRankObj.name = this._displayName[1];
            dotSymbolRankObj.value = this.symbolRankToString(this._selectedFeature.symbolRank);
            dotSymbolRankObj.group = this._group[0];
            dotSymbolRankObj.editor = {
                "type": 'combobox',
                "options": {"valueField": 'value', "textField": 'text', "data": symbolRankRows}
            };

            // 显示模式
            var dotSymbolShowModeObj = new Object();
            dotSymbolShowModeObj.name = this._displayName[2];
            dotSymbolShowModeObj.value = this.showModeToString(this._selectedFeature.showMode);
            dotSymbolShowModeObj.group = this._group[0];
            dotSymbolShowModeObj.editor = {
                "type": 'combobox',
                "options": {"valueField": 'value', "textField": 'text', "data": dotShowModeRows}
            };

            // 模型ID
            var modelIdObj = new Object();
            modelIdObj.name = this._displayName[3];
            modelIdObj.value = this._selectedFeature.modelPath;
            modelIdObj.group = this._group[0];
            modelIdObj.editor = "text";

            // 图片路径
            var picturePathObj = new Object();
            picturePathObj.name = this._displayName[4];
            picturePathObj.value = this._selectedFeature.picturePath;
            picturePathObj.group = this._group[0];
            picturePathObj.editor = "text";


            // 线宽
            var lineWidthObj = new Object();
            lineWidthObj.name = this._displayLineStyleName[0];
            lineWidthObj.value = 1 === graphicObject._symbolType ? this._selectedFeature.gridLineWidth : this._selectedFeature.symbolStyle.lineWidth;
            lineWidthObj.group = this._group[3];
            lineWidthObj.editor = "text";

            // 线色
            var lineColorObj = new Object();
            lineColorObj.name = this._displayLineStyleName[1];
            lineColorObj.value = this.colorGeometryToString(this._selectedFeature.symbolStyle.lineColor);
            lineColorObj.group = this._group[3];
            lineColorObj.editor = "colorpicker";

            // 线型
            var lineStyleObj = new Object();
            lineStyleObj.name = this._displayLineStyleName[2];
            lineStyleObj.value = this.lineStyleToString(this._selectedFeature.lineSymbolID);
            lineStyleObj.group = this._group[3];
            lineStyleObj.editor = {
                "type": 'combobox',
                "options": {"valueField": 'value', "textField": 'text', "data": lineStyleRows}
            };

            // 填充背景色
            var fillBackColorObj = new Object();
            fillBackColorObj.name = this._displayFillStyleName[0];
            fillBackColorObj.value = this.colorGeometryToString(this._selectedFeature.symbolStyle.fillBackColor);
            fillBackColorObj.group = this._group[4];
            fillBackColorObj.editor = "colorpicker";

            // 背景透明
            var fillBackOpaqueObj = new Object();
            fillBackOpaqueObj.name = this._displayFillStyleName[1];
            fillBackOpaqueObj.value = this._selectedFeature.symbolStyle.fillBackOpaque;
            fillBackOpaqueObj.group = this._group[4];
            fillBackOpaqueObj.editor = {"type": "checkbox", "options": {"on": true, "off": false}};

            // 渐变填充角度
            var fillGradientAngleObj = new Object();
            fillGradientAngleObj.name = this._displayFillStyleName[2];
            fillGradientAngleObj.value = this._selectedFeature.symbolStyle.fillGradientAngle;
            fillGradientAngleObj.group = this._group[4];
            fillGradientAngleObj.editor = "text";

            // 渐变填充模式
            var fillGradientModeObj = new Object();
            fillGradientModeObj.name = this._displayFillStyleName[3];
            fillGradientModeObj.value = this.fillGradientModeToString(this._selectedFeature.symbolStyle.fillGradientMode);
            fillGradientModeObj.group = this._group[4];
            fillGradientModeObj.editor = {
                "type": 'combobox',
                "options": {"valueField": 'value', "textField": 'text', "data": fillGradientRows}
            };

            // 渐变填充竖直偏移
            var fillGradientOffsetRatioYObj = new Object();
            fillGradientOffsetRatioYObj.name = this._displayFillStyleName[4];
            fillGradientOffsetRatioYObj.value = this._selectedFeature.symbolStyle.fillGradientOffsetRatioY;
            fillGradientOffsetRatioYObj.group = this._group[4];
            fillGradientOffsetRatioYObj.editor = "text";

            // 渐变填充水平偏移
            var fillGradientOffsetRatioXObj = new Object();
            fillGradientOffsetRatioXObj.name = this._displayFillStyleName[5];
            fillGradientOffsetRatioXObj.value = this._selectedFeature.symbolStyle.fillGradientOffsetRatioY;
            fillGradientOffsetRatioXObj.group = this._group[4];
            fillGradientOffsetRatioXObj.editor = "text";

            // 前景色
            var fillForeColorObj = new Object();
            fillForeColorObj.name = this._displayFillStyleName[6];
            fillForeColorObj.value = this.colorGeometryToString(this._selectedFeature.symbolStyle.fillForeColor);
            fillForeColorObj.group = this._group[4];
            fillForeColorObj.editor = "colorpicker";

            // 填充模式
            var fillSymbolIdObj = new Object();
            fillSymbolIdObj.name = this._displayFillStyleName[7];
            fillSymbolIdObj.value = this.fillSymbolIdToString(this._selectedFeature.symbolStyle.fillSymbolID);
            fillSymbolIdObj.group = this._group[4];
            fillSymbolIdObj.editor = {
                "type": 'combobox',
                "options": {"valueField": 'value', "textField": 'text', "data": fillSymbolIDRows}
            };

            // 填充透明度
            var fillOpaqueRateObj = new Object();
            fillOpaqueRateObj.name = this._displayFillStyleName[8];
            fillOpaqueRateObj.value = this._selectedFeature.symbolStyle.fillOpaqueRate;
            fillOpaqueRateObj.group = this._group[4];
            fillOpaqueRateObj.editor = "text";

            // 文本内容
            var textContentObj = new Object();
            textContentObj.name = this._displayTextContentName[0];
            if (34 == this._selectedFeature.symbolType) {
                textContentObj.value = this._selectedFeature.textContent;
            } else {
                textContentObj.value = this._selectedFeature.textContent;
            }
            textContentObj.group = this._group[5];
            textContentObj.editor = "text";

            // 注记位置
            var markPosObj = new Object();
            markPosObj.name = this._displayTextContentName[1];
            markPosObj.value = this.annotationToString(this._selectedFeature.textPos);
            markPosObj.group = this._group[5];
            markPosObj.editor = {
                "type": 'combobox',
                "options": {"valueField": 'value', "textField": 'text', "data": annotationRows}
            };

            // 字体背景颜色
            var fontBackColor = new Object();
            fontBackColor.name = this._displayTextContentName[2];
            fontBackColor.value = this.colorGeometryToString(this._selectedFeature.symbolTextStyle.backColor);
            fontBackColor.group = this._group[5];
            fontBackColor.editor = "colorpicker";

            // 注记字体大小
            var fontSizeObj = new Object();
            fontSizeObj.name = this._displayTextContentName[3];
            fontSizeObj.value = this._selectedFeature.symbolTextStyle.fontSize;
            fontSizeObj.group = this._group[5];
            fontSizeObj.editor = "text";

            // 注记字体名称
            var fontFamilyObj = new Object();
            fontFamilyObj.name = this._displayTextContentName[4];
            fontFamilyObj.value = this._selectedFeature.symbolTextStyle.fontName;
            fontFamilyObj.group = this._group[5];
            fontFamilyObj.editor = "text";

            // 注记字体颜色
            var fontColorObj = new Object();
            fontColorObj.name = this._displayTextContentName[5];
            fontColorObj.value = this.colorGeometryToString(this._selectedFeature.symbolTextStyle.foreColor);
            fontColorObj.group = this._group[5];
            fontColorObj.editor = "colorpicker";

            // 注记边框
            var fontHaloObj = new Object();
            fontHaloObj.name = this._displayTextContentName[6];
            fontHaloObj.value = this.checkboxValueToString(this._selectedFeature.symbolTextStyle.outline);
            fontHaloObj.group = this._group[5];
            fontHaloObj.editor = {"type": "checkbox", "options": {"on": true, "off": false}};

            // 注记边框宽度
            var outlineWidthObj = new Object();
            outlineWidthObj.name = this._displayTextContentName[7];
            outlineWidthObj.value = this._selectedFeature.symbolTextStyle.outlineWidth;
            outlineWidthObj.group = this._group[5];
            outlineWidthObj.editor = "text";

            // 注记边框颜色
            var outlineColorObj = new Object();
            outlineColorObj.name = this._displayTextContentName[8];
            outlineColorObj.value = this.colorGeometryToString(this._selectedFeature.symbolTextStyle.outlineColor);
            outlineColorObj.group = this._group[5];
            outlineColorObj.editor = "colorpicker";

            // 衬线类型
            var surroundLineTypeObj = new Object();
            surroundLineTypeObj.name = this._displaySurroundLineName[0];
            surroundLineTypeObj.value = this.surroundLineTypeToString(this._selectedFeature);
            surroundLineTypeObj.group = this._group[1];
            surroundLineTypeObj.editor = {
                "type": 'combobox',
                "options": {"valueField": 'value', "textField": 'text', "data": surroundLineTypeRows}
            };

            // 衬线宽
            var surroundLineWidthObj = new Object();
            surroundLineWidthObj.name = this._displaySurroundLineName[1];
            surroundLineWidthObj.value = 1===this._selectedFeature.symbolType ? this._selectedFeature.gridSurroundLineWidth : this._selectedFeature.symbolStyle.surroundLineWidth;
            surroundLineWidthObj.group = this._group[1];
            surroundLineWidthObj.editor = "text";

            // 衬线色
            var surroundLineColorObj = new Object();
            surroundLineColorObj.name = this._displaySurroundLineName[2];
            surroundLineColorObj.value = this.colorGeometryToString(this._selectedFeature.symbolStyle.surroundLineColor);
            surroundLineColorObj.group = this._group[1];
            surroundLineColorObj.editor = "colorpicker";

            // 标号大小
            var gridSymbolSizeXObj, gridSymbolSizeYObj,pictureSymbolSizeXObj,pictureSymbolSizeYObj,rotationX, rotationY,rotationZ,scaleX,scaleY,scaleZ;
            var modelScale, modelRotateX, modelRotateY, modelRotateZ;
            if (this._selectedFeature._symbolType === 1) {
                gridSymbolSizeXObj = new Object();
                gridSymbolSizeXObj.name = this._displayName[6];
                gridSymbolSizeXObj.value = parseInt(this._selectedFeature.gridSymbolSize.x);
                gridSymbolSizeXObj.group = this._group[2];
                gridSymbolSizeXObj.editor = "text";

                // 标号大小
                gridSymbolSizeYObj = new Object();
                gridSymbolSizeYObj.name = this._displayName[7];
                gridSymbolSizeYObj.value = parseInt(this._selectedFeature.gridSymbolSize.y);
                gridSymbolSizeYObj.group = this._group[2];
                gridSymbolSizeYObj.editor = "text";

                // 图片大小X
                pictureSymbolSizeXObj = new Object();
                pictureSymbolSizeXObj.name = this._displayName[6];
                pictureSymbolSizeXObj.value = this._selectedFeature.pictureSymbolSize.x;
                pictureSymbolSizeXObj.group = this._group[10];
                pictureSymbolSizeXObj.editor = "text";

                // 图片大小Y
                pictureSymbolSizeYObj = new Object();
                pictureSymbolSizeYObj.name = this._displayName[7];
                pictureSymbolSizeYObj.value = this._selectedFeature.pictureSymbolSize.y;
                pictureSymbolSizeYObj.group = this._group[10];
                pictureSymbolSizeYObj.editor = "text";
                if(2 === this._selectedFeature.showMode){
                    modelScale = new Object();
                    modelScale.name = this._displayName[12];
                    modelScale.value = this._selectedFeature.modelScale.x;
                    modelScale.group = this._group[8];
                    modelScale.editor = "text";
                }else if(0 === this._selectedFeature.showMode){

                    // 缩放比例X
                    scaleX = new Object();
                    scaleX.name = this._displayName[13];
                    scaleX.value = this._selectedFeature.vectorScale;
                    scaleX.group = this._group[8];
                    scaleX.editor = "text";
                }

                if(2 === this._selectedFeature.showMode){
                    modelRotateX = new Object();
                    modelRotateX.name = this._displayName[8];
                    modelRotateX.value = this._selectedFeature.modelRotate.x;
                    modelRotateX.group = this._group[9];
                    modelRotateX.editor = "text";

                    modelRotateY = new Object();
                    modelRotateY.name = this._displayName[9];
                    modelRotateY.value = this._selectedFeature.modelRotate.y;
                    modelRotateY.group = this._group[9];
                    modelRotateY.editor = "text";

                    modelRotateZ = new Object();
                    modelRotateZ.name = this._displayName[10];
                    modelRotateZ.value = this._selectedFeature.modelRotate.z;
                    modelRotateZ.group = this._group[9];
                    modelRotateZ.editor = "text";
                }else if(0 === this._selectedFeature.showMode){
                    // 旋转角度X
                    rotationX = new Object();
                    rotationX.name = this._displayName[8];
                    rotationX.value = this._selectedFeature.vectorRotate.x;
                    rotationX.group = this._group[9];
                    rotationX.editor = "text";

                    // 旋转角度Y
                    rotationY = new Object();
                    rotationY.name = this._displayName[9];
                    rotationY.value = this._selectedFeature.vectorRotate.y;
                    rotationY.group = this._group[9];
                    rotationY.editor = "text";

                    // 旋转角度Z
                    rotationZ = new Object();
                    rotationZ.name = this._displayName[10];
                    rotationZ.value = this._selectedFeature.vectorRotate.z;
                    rotationZ.group = this._group[9];
                    rotationZ.editor = "text";
                }

            }

            var selectedFeature = this._selectedFeature;

            if (34 === selectedFeature.symbolType
            ||  20 === selectedFeature.symbolType) {
                if (20 === selectedFeature.symbolType) {
                    rows.push(picturePathObj);
                    rows.push(pictureSymbolSizeXObj);
                    rows.push(pictureSymbolSizeYObj);
                } else {
                    rows.push(textContentObj);
                    rows.push(fontHaloObj);
                    rows.push(fontBackColor);
                    rows.push(fontSizeObj);
                    rows.push(fontFamilyObj);
                    rows.push(fontColorObj);
                    rows.push(outlineWidthObj);
                    rows.push(outlineColorObj);
                }
            }
            // 点标号
            if (1 === selectedFeature.symbolType) {
                if (0 === selectedFeature.showMode
                    || 1 === selectedFeature.showMode) {
                    rows.push(surroundLineTypeObj);
                    rows.push(surroundLineWidthObj);
                    rows.push(surroundLineColorObj);
                    rows.push(dotSymbolRankObj);
                }
                rows.push(dotSymbolShowModeObj);
                if (1 === selectedFeature.showMode) {
                    rows.push(dotSymbolNegativeImageObj);
                }
                rows.push(modelIdObj);
                if (0 === selectedFeature.showMode) {
                    rows.push(scaleX);
                    rows.push(rotationX);
                    rows.push(rotationY);
                    rows.push(rotationZ);
                }
                if (2 === selectedFeature.showMode) {
                	rows.push(modelScale);
                	rows.push(modelRotateX);
                	rows.push(modelRotateY);
                	rows.push(modelRotateZ);
                }
                if (3 === selectedFeature.showMode) {
                    rows.push(pictureSymbolSizeXObj);
                    rows.push(pictureSymbolSizeYObj);
                }
                rows.push(picturePathObj);
                if (0 === selectedFeature.showMode
                    || 1 === selectedFeature.showMode) {
                    rows.push(fillBackColorObj);
                    rows.push(fillBackOpaqueObj);
                    rows.push(fillGradientAngleObj);
                    rows.push(fillGradientModeObj);
                    rows.push(fillGradientOffsetRatioYObj);
                    rows.push(fillGradientOffsetRatioXObj);
                    rows.push(fillForeColorObj);
                    rows.push(fillSymbolIdObj);
                    rows.push(fillOpaqueRateObj);
                }
                if (0 === selectedFeature.showMode
                ||  1 === selectedFeature.showMode
                ||  2 === selectedFeature.showMode) {
                    rows.push(textContentObj);
                    rows.push(fontSizeObj);
                    rows.push(fontColorObj);
                    rows.push(fontFamilyObj);
                    rows.push(markPosObj);
                    rows.push(fontHaloObj);
                    rows.push(outlineWidthObj);
                    rows.push(outlineColorObj);
                }
                if (0 === selectedFeature.showMode
                ||  1 === selectedFeature.showMode) {
                    rows.push(lineWidthObj);
                    rows.push(lineColorObj);
                    if (1 === selectedFeature.showMode) {
                        rows.push(lineStyleObj);
                        rows.push(gridSymbolSizeXObj);
                        rows.push(gridSymbolSizeYObj);
                    }
                }

                var longitudeObj = new Object();
                longitudeObj.name = this._displayPositionName[0];
                longitudeObj.value = selectedFeature.localPoints[0].x;
                longitudeObj.group = "位置点";
                longitudeObj.index = 0;
                longitudeObj.editor = "text";

                var latitudeObj = new Object();
                latitudeObj.name = this._displayPositionName[1];
                latitudeObj.value = selectedFeature.localPoints[0].y;
                latitudeObj.group = "位置点";
                latitudeObj.index = 0;
                latitudeObj.editor = "text";

                var altitudeObj = new Object();
                altitudeObj.name = this._displayPositionName[2];
                altitudeObj.value = selectedFeature.localPoints[0].z;
                altitudeObj.group = "位置点";
                altitudeObj.index = 0;
                altitudeObj.editor = "text";

                rows.push(longitudeObj);
                rows.push(latitudeObj);
                rows.push(altitudeObj);
            }
            else {
                rows.push(surroundLineTypeObj);
                rows.push(surroundLineWidthObj);
                rows.push(surroundLineColorObj);
                rows.push(fillBackColorObj);
                rows.push(fillBackOpaqueObj);
                rows.push(fillGradientAngleObj);
                rows.push(fillGradientModeObj);
                rows.push(fillGradientOffsetRatioYObj);
                rows.push(fillGradientOffsetRatioXObj);
                rows.push(fillForeColorObj);
                rows.push(fillSymbolIdObj);
                rows.push(fillOpaqueRateObj);
                rows.push(lineWidthObj);
                rows.push(lineColorObj);

                if(selectedFeature.subSymbols){
                    //子标号
                    for (var i=0; i<selectedFeature.subSymbols.length; ++i) {
                        var objectSubCode = new Object();
                        objectSubCode.name = "Code";
                        objectSubCode.value = selectedFeature.subSymbols[i].code;
                        objectSubCode.group = this._group[6];
                        objectSubCode.editor = {"type":'combobox', "options" : { "valueField": 'value', "textField": 'text', "data" : subSymbolsTypeRows }};
                        objectSubCode.index = i;
                        rows.push(objectSubCode);
                    }
                    if ((0 === selectedFeature.subSymbols.length && 0 === selectedFeature.libID && 1025 === selectedFeature.code) ||
                        (0 === selectedFeature.subSymbols.length && 100 === selectedFeature.libID && 25200 === selectedFeature.code) ||
                        (0 === selectedFeature.subSymbols.length && 100 === selectedFeature.libID && 3020901 === selectedFeature.code)) {
                        var objectSubCode1 = new Object();
                        objectSubCode1.name = "Code";
                        objectSubCode1.value = subSymbolsTypeString(selectedFeature.subSymbols.length, selectedFeature);
                        objectSubCode1.group = this._group[6];
                        objectSubCode1.editor = {"type" : 'combobox', "options" : { "valueField" : 'value', "textField" : "text", "data" : subSymbolsTypeRows }};
                        objectSubCode1.index = i;
                        rows.push(objectSubCode1);
                    }
                }


                if (1025 === selectedFeature.symbolType && selectedFeature.subSymbols.length > 0) {
                    var objectLibID = new Object();
                    objectLibID.name = "LibID";
                    objectLibID.value = libIDToString(selectedFeature.subSymbols[0].libID);
                    objectLibID.group = this._group[6];
                    objectLibID.editor = "text";
                    rows.push(objectLibID);
                }

                for (var i=0; i<selectedFeature.localPoints.length; ++i) {
                	var longitudeObj = new Object();
                	longitudeObj.name = this._displayPositionName[0];
                	longitudeObj.value = selectedFeature.localPoints[i].x;
                	longitudeObj.group = "位置点"+(i+1);
                	longitudeObj.index = i;
                	longitudeObj.editor = "text";

                	var latitudeObj = new Object();
                	latitudeObj.name = this._displayPositionName[1];
                	latitudeObj.value = selectedFeature.localPoints[i].y;
                	latitudeObj.group = "位置点"+(i+1);
                	latitudeObj.index = i;
                	latitudeObj.editor = "text";

                	var altitudeObj = new Object();
                	altitudeObj.name = this._displayPositionName[2];
                	altitudeObj.value = selectedFeature.localPoints[i].z;
                    altitudeObj.group = "位置点"+(i+1);
                    altitudeObj.index = i;
                    altitudeObj.editor = "text";

                    rows.push(longitudeObj);
                    rows.push(latitudeObj);
                    rows.push(altitudeObj);
                }
            }
            return rows;
        }
    };

    StylePanel.prototype.updateSelectFeature = function(updated, selectFeature) {
        var _self = this;
        if (null != updated && selectFeature) {
            switch (updated.name) {
                case this._displayName[0]:
                    selectFeature.isNegativeImage = this.fromCheckboxValue(updated.value);
                    break;
                case this._displayName[1]:
                    selectFeature.symbolRank = parseInt(updated.value);
                    break;
                case this._displayName[2]:
                    var mode = parseInt(updated.value);
                    if (2 === mode && 0 === selectFeature.modelPath.length) {
                        return;
                    }
                    if (3 === mode && 0 === selectFeature.picturePath.length) {
                        return;
                    }
                    selectFeature.showMode = parseInt(updated.value);
                    break;
                case this._displayName[3]:
                    selectFeature.modelPath = updated.value;
                    break;
                case this._displayName[4]:
                    selectFeature.picturePath = updated.value;
                    break;
                case this._displayName[5]:
                    selectFeature.symbolStyle.wholeHeight = parseInt(updated.value);
                    break;
                case this._displayName[6]:
                    if (updated.group === this._group[10]) {
                        selectFeature.pictureSymbolSize = {x:parseInt(updated.value),y:selectFeature.pictureSymbolSize.y};
                    } else {
                        selectFeature.gridSymbolSize = {x:parseInt(updated.value),y:selectFeature.gridSymbolSize.y};
                    }
                    break;
                case this._displayName[7]:
                    if (updated.group === this._group[10]) {
                        selectFeature.pictureSymbolSize = {x:selectFeature.pictureSymbolSize.x,y:parseInt(updated.value)};
                    } else {
                        selectFeature.gridSymbolSize = {x:selectFeature.gridSymbolSize.x,y:parseInt(updated.value)};
                    }
                    break;
                case this._displayName[8]:
                    if (updated.group === this._group[8]) {
                        selectFeature.scale.x = parseInt(updated.value);
                    } else if (updated.group === this._group[9]) {
                        if (2 === selectFeature.showMode) {
                            var rotate = selectFeature.modelRotate;
                            selectFeature.setModelRotate(parseInt(updated.value), rotate.y , rotate.z);
                        } else {
                            var rotate = selectFeature.vectorRotate;
                            selectFeature.setVectorRotate(parseInt(updated.value), rotate.y , rotate.z);
                        }
                    }
                    break;
                case this._displayName[9]:
                    if (updated.group === this._group[8]) {
                        selectFeature.scale.y = parseInt(updated.value);
                    } else if (updated.group === this._group[9]) {
                        if (2 === selectFeature.showMode) {
                            var rotate = selectFeature.modelRotate;
                            selectFeature.setModelRotate(rotate.x,  parseInt(updated.value), rotate.z);
                        } else {
                            var rotate = selectFeature.vectorRotate;
                            selectFeature.setVectorRotate(rotate.x,  parseInt(updated.value), rotate.z);
                        }
                    }
                    break;
                case this._displayName[10]:
                    if (updated.group === this._group[8]) {
                        selectFeature.scale.z = parseInt(updated.value);
                    } else if (updated.group === this._group[9]) {
                        if (2 === selectFeature.showMode) {
                            var rotate = selectFeature.modelRotate;
                            selectFeature.setModelRotate(rotate.x, rotate.y, parseInt(updated.value));
                        } else {
                            var rotate = selectFeature.vectorRotate;
                            selectFeature.setVectorRotate(rotate.x, rotate.y, parseInt(updated.value));
                        }
                    }
                    break;
                case this._displayName[12]:
                    var modelScale = selectFeature.modelScale;
                    selectFeature.modelScale = new cesium.Cartesian3(parseInt(updated.value),modelScale.y,modelScale.z);
                    break;
                case this._displayName[13]:
                    selectFeature.vectorScale = parseFloat(updated.value);
                    break;
                case this._displaySurroundLineName[0]:
                    selectFeature.symbolStyle.surroundLineType = parseInt(updated.value);
                    break;
                case this._displaySurroundLineName[1]:
                    if (1 === selectFeature.symbolType) {
                        selectFeature.gridSurroundLineWidth = parseInt(updated.value);
                    } else {
                        selectFeature.symbolStyle.surroundLineWidth = parseInt(updated.value);
                    }
                    break;
                case this._displaySurroundLineName[2]:
                    selectFeature.symbolStyle.surroundLineColor = colorConvert(updated.value);
                    break;
                case this._displaySurroundLineName[3]:
                    break;
                case this._displayFillStyleName[0]:
                    selectFeature.symbolStyle.fillBackColor = colorConvert(updated.value);
                    break;
                case this._displayFillStyleName[1]:
                    selectFeature.symbolStyle.fillBackOpaque = this.fromCheckboxValue(updated.value);
                    break;
                case this._displayFillStyleName[2]:
                    selectFeature.symbolStyle.fillGradientAngle = parseInt(updated.value);
                    break;
                case this._displayFillStyleName[3]:
                    selectFeature.symbolStyle.fillGradientMode = parseInt(updated.value);
                    break;
                case this._displayFillStyleName[4]:
                    selectFeature.symbolStyle.fillGradientOffsetRatioY = parseInt(updated.value);
                    break;
                case this._displayFillStyleName[5]:
                    selectFeature.symbolStyle.fillGradientOffsetRatioX = parseInt(updated.value);
                    break;
                case this._displayFillStyleName[6]:
                    selectFeature.symbolStyle.fillForeColor = colorConvert(updated.value);
                    break;
                case this._displayFillStyleName[7]:
                    selectFeature.symbolStyle.fillSymbolID = parseInt(updated.value);
                    break;
                case this._displayFillStyleName[8]:
                    selectFeature.symbolStyle.fillOpaqueRate = parseInt(updated.value);
                    break;
                case this._displayLineStyleName[0]:
                    if (1===selectFeature.symbolType) {
                        selectFeature.gridLineWidth = parseFloat(updated.value);
                    } else {
                        selectFeature.symbolStyle.lineWidth = parseFloat(updated.value);
                    }
                    break;
                case this._displayLineStyleName[1]:
                    selectFeature.symbolStyle.lineColor = colorConvert(updated.value);
                    break;
                case this._displayLineStyleName[2]:
                    selectFeature.lineSymbolID = parseInt(updated.value);
                    break;
                case this._displayTextContentName[0]:
                    selectFeature.textContent = updated.value;
                    break;
                case this._displayTextContentName[1]:
                    selectFeature.textPos = parseInt(updated.value);
                    break;
                case this._displayTextContentName[2]:
                    selectFeature.symbolTextStyle.backColor = colorConvert(updated.value);
                    break;
                case this._displayTextContentName[3]:
                    selectFeature.symbolTextStyle.fontSize = parseInt(updated.value);
                    break;
                case this._displayTextContentName[4]:
                    selectFeature.symbolTextStyle.fontName = updated.value;
                    break;
                case this._displayTextContentName[5]:
                    selectFeature.symbolTextStyle.foreColor = colorConvert(updated.value);
                    break;
                case this._displayTextContentName[6]:
                    selectFeature.symbolTextStyle.outline = this.fromCheckboxValue(updated.value);
                    break;
                case this._displayTextContentName[7]:
                    selectFeature.symbolTextStyle.outlineWidth = parseFloat(updated.value);
                    break;
                case this._displayTextContentName[8]:
                    selectFeature.symbolTextStyle.outlineColor = colorConvert(updated.value);
                    break;
                case this._displayPositionName[0]:
                    var pts = [];
                    for (var i=0; i<selectFeature.localPoints.length; ++i) {
                        pts.push(selectFeature.localPoints[i].clone());
                    }
                    pts[updated.index].x = parseInt(updated.value);
                    selectFeature.localPoints = pts;
                    break;
                case this._displayPositionName[1]:
                    var pts = [];
                    for (var i=0; i<selectFeature.localPoints.length; ++i) {
                        pts.push(selectFeature.localPoints[i].clone());
                    }
                    pts[updated.index].y = parseInt(updated.value);
                    selectFeature.localPoints = pts;
                    break;
                case this._displayPositionName[2]:
                    var pts = [];
                    for (var i=0; i<selectFeature.localPoints.length; ++i) {
                        pts.push(selectFeature.localPoints[i].clone());
                    }
                    pts[updated.index].z = parseInt(updated.value);
                    selectFeature.localPoints = pts;
                    break;
                default:
                    break;
            }
            if (updated.group == this._group[6]) {
                if (updated.name == "LibID") {
                    if (null !== updated.value) {
                        selectFeature.subSymbols[0].libID = parseInt(updated.value);
                    }
                }
                //设置子标号
                if (updated.name == "Code") {
                    var code = parseInt(updated.value);

                    if(selectFeature.symbolType === 1025 && code != null) {
                        var symbolLibManager = this._plotting.getSymbolLibManager();
                        var subCode = symbolLibManager.findSymbolByCode(code);
                        if(subCode.length !== 0 && subCode[0].symbolType === "SYMBOL_DOT"){
                            //selectFeature.subSymbols[updated.index] = {libID : subCode[0].libID, code : code};
                            var temp = {libID : subCode[0].libID, code : code};
                            selectFeature.setSubSymbols(temp,updated.index);
                        }

                    } else {
                        var temp = {libID:selectFeature.libID,code:code };
                        selectFeature.setSubSymbols(temp,updated.index);
                    }
                }
            }
        }
        var rows = _self.collectionPropertyGridRows(_self._selectedFeature);
        $('#pg').propertygrid('loadData', rows);
    };

    function colorConvert(colorString) {
        var red = parseInt(colorString.slice(1, 3), 16) / 255;
        var green = parseInt(colorString.slice(3, 5), 16) / 255;
        var blue = parseInt(colorString.slice(5, 7), 16) / 255;
        return {red : red, green : green, blue : blue, alpha : 1};
    }

    StylePanel.prototype.getAnnotationRows = function(graphicObject) {
        var annotationRows = [];
        annotationRows.push({"value" : "4", "text" : "上"});
        if (graphicObject.middleMarkExist) {
            annotationRows.push({"value" : "8", "text" : "中间"});
        }
        return annotationRows;
    };

    StylePanel.prototype.getSymbolRankRows = function(graphicObject) {
        var symbolRanks = [];
        if (graphicObject && graphicObject.symbolRanks) {
            symbolRanks = graphicObject.symbolRanks;
        }
        var rows = [];
        rows.push({"value" : "0", "text" : "无级别"});
        for (var i=0; i<symbolRanks.length; ++i) {
            if (1 == symbolRanks[i]) {
                rows.push({"value" : "1", "text" : "军区级"});
            } else if (2 == symbolRanks[i]) {
                rows.push({"value" : "2", "text" : "副大军区级"});
            } else if (3 == symbolRanks[i]) {
                rows.push({"value" : "3", "text" : "集团军级"});
            } else if (4 == symbolRanks[i]) {
                rows.push({"value" : "4", "text" : "师级"});
            } else if (5 == symbolRanks[i]) {
                rows.push({"value" : "5", "text" : "旅级"});
            } else if (6 == symbolRanks[i]) {
                rows.push({"value" : "6", "text" : "团级"});
            } else if (7 == symbolRanks[i]) {
                rows.push({'value' : "7", "text" : "营级"});
            } else if (8 == symbolRanks[i]) {
                rows.push({'value' : "8", "text" : "连级"});
            } else if (9 == symbolRanks[i]) {
                rows.push({'value' : "9", "text" : "排级"});
            }
        }
        return rows;
    };

    StylePanel.prototype.getSurroundLineTypeRows = function(graphicObject) {
        var rows = [];
        if (null == graphicObject || undefined == graphicObject) {
            return [];
        }
        var symbolType = graphicObject.symbolType;
        if (1 == symbolType) {
            rows.push({"value" : "0", "text" : "无衬线"});
            rows.push({"value" : "1", "text" : "有衬线"});
        } else {
            rows.push({"value" : "0", "text" : "无衬线"});
            rows.push({"value" : "1", "text" : "内侧衬线"});
            rows.push({"value" : "2", "text" : "外侧衬线"});
            rows.push({"value" : "3", "text" : "双侧衬线"});
        }
        return rows;
    };


    StylePanel.prototype.getDotShowModeRows = function(graphicObject) {

        var rows = [];
        rows.push({"value" : "0", "text" : "矢量模式"});
        rows.push({"value" : "1", "text" : "公告板模式"});
        rows.push({"value" : "2", "text" : "模型模式"});
        rows.push({"value" : "3", "text" : "图片模式"});
        return rows;

    };

    StylePanel.prototype.getFillGradientModeRows = function(graphicObject) {
        var rows = [];

        rows.push({"value" : "0", "text" : "无渐变"});
        rows.push({"value" : "1", "text" : "线性渐变"});
        rows.push({"value" : "2", "text" : "辐射渐变"});

        return rows;
    };

    StylePanel.prototype.getLineStyleRows = function(graphicObject) {
        var rows = [];

        rows.push({"value" : "0", "text" : "实线"});
        rows.push({"value" : "1", "text" : "长虚线"});
        rows.push({"value" : "2", "text" : "由点构成的直线"});
        rows.push({"value" : "3", "text" : "由线划线段构成的直线"});
        rows.push({"value" : "4", "text" : "由重复的线划点图案构成的直线"});

        return rows;
    };

    StylePanel.prototype.getSubSymbolsTypeRows = function(graphicObject) {

        var rows = [];
        rows.push({"value" : "0", "text" : ""});

        if (100 === graphicObject.libID) {
            rows.push({"value" : "100", "text" : "陆军"});
            rows.push({"value" : "200", "text" : "海军"});
            rows.push({"value" : "300", "text" : "空军"});
        } else if (123 === graphicObject.libID) {
            rows.push({"value" : "10101", "text" : "武装警察部队"});
            rows.push({"value" : "10102", "text" : "防爆装甲"});
            rows.push({"value" : "10103", "text" : "火炮"});
        } else if (900 === graphicObject.libID) {
            rows.push({"value" : "910200", "text" : "人民防空重点城市"});
            rows.push({"value" : "910300", "text" : "人民防空基本指挥所"});
            rows.push({"value" : "910402", "text" : "水路抢修专业队"});
        } else if (0 === graphicObject.libID) {
            rows.push({"value" : "9", "text" : "刑警"});
            rows.push({"value" : "80103", "text" : "交警"});
            rows.push({"value" : "80109", "text" : "专业警"});
        }
        return rows;
    };

    function subSymbolsTypeString(subSymbolsLength, geometry) {

        if (0 === subSymbolsLength) {
            return "";
        } else {
            if (100 === geometry.libID) {
                if (100 === geometry.subSymbols[0].code) {
                    return "陆军";
                }
                if (123 === geometry.subSymbols[0].code) {
                    return "海军";
                }
                if (300 === geometry.subSymbols[0].code) {
                    return "空军";
                }
            } else if (123 === geometry.libID) {
                if (10101 === geometry.subSymbols[0].code) {
                    return "武装警察部队";
                }
                if (10102 === geometry.subSymbols[0].code) {
                    return "防爆装甲";
                }
                if (10103 === geometry.subSymbols[0].code) {
                    return "火炮";
                }
            } else if (900 === geometry.libID) {
                if (910200 === geometry.subSymbols[0].code) {
                    return "人民防空重点城市";
                }
                if (910300 === geometry.subSymbols[0].code) {
                    return "人民防空基本指挥所";
                }
                if (910402 === geometry.subSymbols[0].code) {
                    return "水路抢修专业队";
                }
            } else if (0 === geometry.libID) {
                if (9 === geometry.subSymbols[0].code) {
                    return "刑警";
                }
                if (80103 === geometry.subSymbols[0].code) {
                    return "交警";
                }
                if (80109 === geometry.subSymbols[0].code) {
                    return "专业警";
                }
            }
        }
    }

    function libIDToString(libID) {
        if (421 == libID) {
            return "421(警用库)";
        } else if (100 == libID) {
            return "100(军队库)";
        } else if (123 == libID) {
            return "123(武警库)";
        } else if (900 == libID) {
            return "900(人防库)";
        }
    }

    StylePanel.prototype.getFillSymbolIDRows = function(graphicObject) {

        var rows = [];
        rows.push({"value" : "0", "text" : "实填充"});
        rows.push({"value" : "1", "text" : "无填充"});
        // rows.push({"value" : "2", "text" : "向上斜填充"});
        // rows.push({"value" : "3", "text" : "十字填充"});
        // rows.push({"value" : "4", "text" : "交叉填充"});
        // rows.push({"value" : "5", "text" : "反斜线填充"});
        // rows.push({"value" : "6", "text" : "水平填充"});
        // rows.push({"value" : "7", "text" : "竖直填充"});
        return rows;
    };

    StylePanel.prototype.displayToString = function(display) {
        if (display && display === "none") {
            return "不显示";
        }
        return "显示";
    };

    StylePanel.prototype.checkboxValueToString = function(checkboxValue) {
        if (true === checkboxValue) {
            return "true";
        } else if (false === checkboxValue) {
            return "false";
        }
    };

    StylePanel.prototype.fromCheckboxValue = function(checkboxStr) {
        if ("true" === checkboxStr) {
            return true;
        } else if ("false" === checkboxStr) {
            return false;
        }
    };

    StylePanel.prototype.symbolRankToString = function(symbolRank) {
        if (0 == symbolRank) {
            return "无级别";
        } else if (1 == symbolRank) {
            return "军区级";
        } else if (2 == symbolRank) {
            return "副大军区级";
        } else if (3 == symbolRank) {
            return "集团军级";
        } else if (4 == symbolRank) {
            return "师级";
        } else if (5 == symbolRank) {
            return "旅级";
        } else if (6 == symbolRank) {
            return "团级";
        } else if (7 == symbolRank) {
            return "营级";
        } else if (8 == symbolRank) {
            return "连级";
        } else if (9 == symbolRank) {
            return "排级";
        }
    };

    StylePanel.prototype.showModeToString = function(dotShowMode) {

        if (0 === dotShowMode) {
            return "矢量模式";
        } else if (1 === dotShowMode) {
            return "公告板模式";
        } else if (2 === dotShowMode) {
            return "模型模式";
        } else if (3 === dotShowMode) {
            return "图片模式";
        } else {
            return "未定义";
        }

    };

    StylePanel.prototype.fillGradientModeToString = function(fillGradientMode) {

        if (0 === fillGradientMode) {
            return "无渐变";
        } else if (1 === fillGradientMode) {
            return "线性渐变";
        } else if (2 === fillGradientMode) {
            return "辐射渐变";
        }

    };

    StylePanel.prototype.annotationToString = function(annotation) {

        if (0 === annotation) {
            return "左上";
        } else if (1 === annotation) {
            return "左下";
        } else if (2 === annotation) {
            return "右上";
        } else if (3 === annotation) {
            return "右下";
        } else if (4 === annotation) {
            return "上";
        } else if (5 === annotation) {
            return "下";
        } else if (6 === annotation) {
            return "左";
        } else if (7 === annotation) {
            return "右";
        } else if (8 === annotation) {
            return "中间";
        }

    };

    StylePanel.prototype.surroundLineTypeToString = function(graphicObject) {

        if (1 === graphicObject.symbolType) {
            if (0 === graphicObject.symbolStyle.surroundLineType) {
                return "无衬线";
            } else if (1 === graphicObject.symbolStyle.surroundLineType) {
                return "有衬线";
            }
        } else {
            if (0 === graphicObject.symbolStyle.surroundLineType) {
                return "无衬线";
            } else if (1 === graphicObject.symbolStyle.surroundLineType) {
                return "内侧衬线";
            } else if (2 === graphicObject.symbolStyle.surroundLineType) {
                return "外侧衬线";
            } else if (3 === graphicObject.symbolStyle.surroundLineType) {
                return "双侧衬线";
            }
        }
    };

    StylePanel.prototype.colorGeometryToString = function(color) {

        var value = color.value;
        var red, green, blue;

        if (undefined !== value && null !== value) {
            red = value[2]>15 ? value[2].toString(16) : "0" + value[2].toString(16);
            green = value[1]>15 ? value[2].toString(16) : "0" + value[1].toString(16);
            blue = value[0]>15 ? value[0].toString(16) : "0" + value[0].toString(16);
        } else {
            red = color.red * 255;
            red = red > 15 ? red.toString(16) : "0" + red;
            green = color.green * 255;
            green = green > 15 ? green.toString(16) : "0" + green;
            blue = color.blue * 255;
            blue = blue > 15 ? blue.toString(16) : "0" + blue;
        }
        return "#" + red + green + blue;
    };



    StylePanel.prototype.lineStyleToString = function(lineStyle) {

        if (0 === lineStyle) {
            return "实线";
        } else if (1 === lineStyle) {
            return "长虚线";
        } else if (2 === lineStyle) {
            return "由点构成的直线";
        } else if (3 === lineStyle) {
            return "由线划线段构成的直线";
        } else if (4 === lineStyle) {
            return "由重复的线划点图案构成的直线";
        }
    };

    StylePanel.prototype.fillSymbolIdToString = function(fillSymbolID) {

        switch (fillSymbolID) {
            case 0:
                return "实填充";
            case 1:
                return "无填充";
        }
    };



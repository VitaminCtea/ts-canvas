## 级联选择器

* <font size="2">根据数据结构可以封装出Tree Node类，通过Tree Node得出当前节点的children和当前节点的父节点parentNode是谁，然后利用观察者模式进行更新与添加节点。</font>

* <font size="2">符合elementUI中的级联选择器的大部分功能，省略了部分功能，可以说是简化的版本。</font>

#### 带滚动条面板DOM结构演示

```html
    <div class="cascadeSelector-menu__container menu-line" data-level="2">
        <div class="cascadeSelector-menu__wrap">
            <div class="scroll-wrap">
                <ul class="cascadeSelector-menu__list" role="menu">
                    <li class="cascadeSelector-menu__item" role="menuitem" value="basic" aria-checked="false">
                        <label class="cascadeSelector-radio" role="radio">
                            <div class="cascadeSelector-radio__input">
                                <span class="cascadeSelector-radio__inner"></span>
                                <input class="cascadeSelector-radio__original" role="radio">
                            </div>
                        </label>
                        <span class="cascadeSelector-node__label">Basic(5)</span>
                    </li>
                    <li class="cascadeSelector-menu__item menu-item__active" role="menuitem" value="form" aria-checked="false">
                        <label class="cascadeSelector-radio" role="radio">
                            <div class="cascadeSelector-radio__input">
                                <span class="cascadeSelector-radio__inner"></span>
                                <input class="cascadeSelector-radio__original" role="radio">
                            </div>
                        </label>
                        <span class="cascadeSelector-node__label">Form(14)</span>
                    </li>
                    <li class="cascadeSelector-menu__item" role="menuitem" value="data" aria-checked="false">
                        <label class="cascadeSelector-radio" role="radio">
                            <div class="cascadeSelector-radio__input">
                                <span class="cascadeSelector-radio__inner"></span>
                                <input class="cascadeSelector-radio__original" role="radio">
                            </div>
                        </label>
                        <span class="cascadeSelector-node__label">Data(6)</span>
                    </li>
                    <li class="cascadeSelector-menu__item" role="menuitem" value="notice" aria-checked="false">
                        <label class="cascadeSelector-radio" role="radio">
                            <div class="cascadeSelector-radio__input">
                                <span class="cascadeSelector-radio__inner"></span>
                                <input class="cascadeSelector-radio__original" role="radio">
                            </div>
                        </label>
                        <span class="cascadeSelector-node__label">Notice(5)</span>
                    </li>
                    <li class="cascadeSelector-menu__item" role="menuitem" value="navigation" aria-checked="false">
                        <label class="cascadeSelector-radio" role="radio">
                            <div class="cascadeSelector-radio__input">
                                <span class="cascadeSelector-radio__inner"></span>
                                <input class="cascadeSelector-radio__original" role="radio">
                            </div>
                        </label>
                        <span class="cascadeSelector-node__label">Navigation(5)</span>
                    </li>
                    <li class="cascadeSelector-menu__item" role="menuitem" value="others" aria-checked="false">
                        <label class="cascadeSelector-radio" role="radio">
                            <div class="cascadeSelector-radio__input">
                                <span class="cascadeSelector-radio__inner"></span>
                                <input class="cascadeSelector-radio__original" role="radio">
                            </div>
                        </label>
                        <span class="cascadeSelector-node__label">Others(6)</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="scrollBar-container scrollBar-vertical" role="scrollBar" aria-orientation="vertical" style="background-color: rgb(221, 221, 221); height: 100%; transition: opacity 0.2s ease 0s; opacity: 0;">
            <div class="scrollBar-thumb" style="background-color: rgb(144, 147, 153); width: 100%; height: 92.5926%;"></div>
        </div>
    </div>
```

#### CSS样式

<font size="2">CSS样式参考elementUI中的CSS样式</font>

#### 配置实例

```javascript
    new CascadeSelector({
        el: document.getElementById('cascadeSelector')!,
        content: [...],
        disabled: true,
        clearable: true,
        showAllLevels: true,
        separator: '/',
        isShowNodeChildrenCount: true,
        checkStrictly: true,
        placeholder: '请选择'
    })
```

#### 属性配置说明

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | :----: | :----: |
| el | 需要将级联选择器挂载到的容器 | HTMLElement | - | - |
| content | 数据 | { value: string label: string disabled?: boolean children?: Options }[] | - | - |
| disabled | 是否禁用面板中的某一个元素。当disabled未启用并且数据里的某一项disabled为true的话，那么数据里的disabled不生效 | boolean | false/true | false |
| clearable | 是否支持清空input中的value值。当checkStrictly属性未开启的话，则当点击叶节点之后input框内才显示清空图标。否则checkStrictly属性开启，则当选中每个节点时，input出现value，则也会出现。 | boolean | false/true | false |
| showAllLevels | 输入框中是否显示选中值的完整路径。设置为false时，仅显示最后一级的值，否则显示完整路径 | boolean | false/true | false |
| separator | 路径分隔符 | string | - | 斜杠'/' |
| isShowNodeChildrenCount | 是否显示数量。启用则不是叶节点的节点显示数量(children.length) | boolean | false/true | false |
| checkStrictly | 是否严格的遵守父子节点不互相关联。正常模式下，只有选择叶节点之后，input中的value才有值。当启用checkStrictly，则每一个路径都会显示。 | boolean | false/true | false |
| placeholder | 输入框占位文本 | string | - | '请选择' |
| 其他 | 不支持hover出现或隐藏面板、不支持input搜索路径、不支持多选模式 | - | - | - |

#### 回调函数说明

| 回调名称 | 说明 | 回调参数 | 回调参数类型 | 返回值 |
| :----: | ---- | :----: | :----: | :----: |
| getValue | 当input输入框的value值变化时触发 | val | string | void |

#### 组件动画演示

* <font size="2">checkStrictly未启用，其他选项都启用的情况: </font>

![checkStrictly未启用](./../../image/cascader1.gif "checkStrictly未启用")

* <font size="2">checkStrictly启用，其他选项都启用的情况: </font>

![checkStrictly启用](./../../image/cascader2.gif "checkStrictly启用")

## 步骤条

#### 实现步骤

* <font size="2">封装Step类。其中Step类包含一些基本信息，例如：processStatus、finishStatus、alignCenter、创建基本DOM、更新步骤(步骤条和步骤)、删除和增加类名。每一个Step类包括进度线、当前步骤小圆圈、标题、描述组成。</font>

* <font size="2">CSS样式。使用flex布局，其中包含要添加已完成的样式类、当前步骤的样式类。例如：is-success、is-finish、is-center、is-line、is-text等等这样的类，每一步都需要添加或删除某个类名，用于指示当前步骤以及已完成步骤的标识。需要注意的是步骤的小圆圈、标题和描述文字信息、步骤条居中的问题</font>

    * <font size="2">居中前置设置，Step容器设置：</font>

        ```css
            /* 先在在每个步骤的容器上设置： */
            flex-basis: 25%;
            max-width: 33.3333%
            /* 不是居中的每个步骤容器设置：每个容器的basis为50%，最后一个步骤容器设置见下方.is-flex类 */
            .is-flex {
                flex-basis: auto!important;
                flex-shrink: 0;
                flex-grow: 0;
                max-width: 33.3333%;
            }
        ```
  
    * <font size="2">步骤条居中：</font>

        ```css
            left: 50%;
            right: -50%;
        ```

    * <font size="2">小圆圈居中：</font>

        ```css
            left: 50%;
            transform: translateX(-50%);
        ```

    * <font size="2">标题文字居中：</font>

        ```css
            text-align: center;
        ```

    * <font size="2">描述文字居中：</font>

        ```css
            /* 需要在描述文字信息容器上设置左右padding*/
            /* 如果设置一方的padding，比如paddingLeft或paddingRight的话，居中就会偏坠。*/
            /* 如果不是居中的话，则设置paddingRight即可。*/
            padding: 0 10%;
        ```

    > <font size="2">Note: 以上参考element组件的Step步骤条组件的样式</font>

* <font size="2">整合Step，创建Steps类，支持用户的一些配置、按钮点击下一步、指定步骤的逻辑等等</font>

#### Step类HTML布局DOM示例

```html
    <div class="step-item" style="flex-basis: 25%;">
        <div class="step-content-head__container is-success">
            <div class="step-line__container is-center">
                <div class="step-line is-line" style="width: 100%;"></div>
            </div>
            <div class="step-text__container" style="left: 50%; transform: translateX(-50%);">
                <span class="step-icon"></span>
            </div>
        </div>
        <div class="step-content__main">
            <div class="step-content-main__title is-success" style="text-align: center;">
                步骤1
            </div>
            <div class="step-content-main__description is-success" style="text-align: justify; padding: 0px 10%;">
                这是步骤1这是步骤1这是步骤1这是步骤1
            </div>
        </div>
    </div>
```

> <font size="2">上述DOM结构内的style属性是根据用户配置以及标识步骤已完成、当前步骤、未到步骤的class控制的。</font>

#### 实例化所有配置演示

```javascript
    new Steps({
        el: document.getElementById('steps')!,
        content: [
            { text: '1', title: '步骤1', description: '这是步骤1这是步骤1这是步骤1这是步骤1' },
            { text: '2', title: '步骤2', description: '这是步骤2' },
            { text: '3', title: '步骤3', description: '这是步骤3' },
            { text: '4', title: '步骤4', description: '这是步骤4' },
            { text: '5', title: '步骤5', description: '这是步骤5' }
        ],
        successColor: '#D30074',
        fixedStep: {
            enabled: true,
            specifySteps: 3
        },
        alignCenter: true,
        descriptionAlignment: [ 'justify', 'center', 'center', 'center', 'center' ]
    })
```

#### 支持用户的配置表

| 参数 | 说明 | 类型 | 配置演示 | 必选 | 默认值 |
| :----: | :---- | :----: | :---- | :----- | :---- |
| el | 用于将步骤条挂载到页面上已存在的容器内 | HTMLElement | el: document.getElementById(container) | Yes | 无
| content | 一个带有圆圈内的文本、步骤条标题、步骤条描述数组 | string[] | content: [{ text: '1', title: '步骤1', description: '这是步骤1' }, ...] | Yes | 无
| successColor | 用于设置成功或已完成步骤的颜色，支持十六进制、RGB、HSL、HSV颜色格式 | string | successColor: blue | No | #67c23a |
| fixedStep | 用于指定步骤，其中enabled表示是否启用，启用之后不产生下一步按钮。specifySteps内的数字不能大于content数组长度 | { enabled: boolean, specifySteps: number } | fixedStep: { enabled: true, specifySteps: 3 } | No | null
| alignCenter | 用于步骤小圆圈和标题、描述文本居中 | boolean | alignCenter: true | No | false
| descriptionAlignment | 用于改变alignCenter启用的时候导致多段落描述文本也是居中状态。数组内的值对应每个步骤下的描述信息，用以使用的对齐方式。比如content的长度为5，那么，[ 'justify', 'center', 'center', 'center', 'center' ]数组依次对应步骤1，步骤2，...以此类推。如果数组内的值都是一样的，比如都是"left"，那么这时只需传一个符合类型的字符串，让您少减少时间。需要说明的是如果只有某一个步骤是多段落的描述信息，为了布局好看，其他步骤描述信息少的、一行以内的，建议使用center。 | (left/center/right/justify)[] or left/center/right/justify | descriptionAlignment: [ 'justify', 'center', 'center', 'center', 'center' ] | No | center
| direction | 用于设置布局方向 | 'horizontal' or 'vertical' | direction: 'horizontal' or direction: 'vertical' | No | horizontal
| button | 用于用户将已有的按钮挂载到容器内，这样方便在页面上任意地方进行布局。默认的按钮在步骤条下方，没有间距。 | HTMLElement | button: document.getElementById(button) | No | null
| icons | 用户可以自定义步骤图标，图标数量必须和content数组长度一致，不支持单个步骤更改图标。 | string[] | icons: [ 'icon-packing', ... ] | No | null

##### 说明

* <font size="2">fixedStep.enabled</font>
  
    > <font size="2">当 "fixedStep.enabled = true"时优先级大于有按钮的操控步骤组件</font>

* <font size="2">当direction为vertical时：</font>

    > * <font size="2">alignCenter设置为true会报错，因为纵向布局，文字居中会导致布局变形。建议不设置或设置为false</font>
    > * <font size="2">fixedStep.enabled = false的情况下会报错，因为纵向布局只支持固定布局，不支持带有按钮进行下一步的功能。必须设置为true。</font>
    > * <font size="2">descriptionAlignment设置会不生效，建议不要设置。</font>

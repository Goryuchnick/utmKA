# **App Name**: UTM Hero

## Core Features:

- UTM Generation: Generate UTM-tagged URLs based on user input and predefined values. Allows users to input a base URL and then select/input values for utm_source, utm_medium, utm_campaign, utm_term, and utm_content. UTM_source and UTM_Medium should have two fields: left field for custom value input, and right field with a dropdown list of predefined values.
- Link History: Displays a history of generated UTM links for the user. Each entry includes the full UTM link, the generation date (in a non-clickable format), and a 'Copy' button to copy the link to the clipboard.
- Responsive Navigation: Implement a navigation bar for switching between pages. In the desktop version it should look like buttons in the header, in the mobile version - at the bottom in the form of a menu bar with an animation.

## Style Guidelines:

- Background: #FBF4F4.
- Primary color for elements: #9e5151.
- Secondary color for elements: #834944.
- Accent color: #D32F2F for emphasis and interactive elements
- Font: Droid Sans Mono (ensure proper licensing).
- Navigation bar: Left side panel on desktop, bottom menu bar on mobile (with animation for switching).

## Original User Request:
Делаем приложение - генератор UTM меток по аналогии с сервисом https://tilda.cc/ru/utm/ . Обязательно сделать несколько разделов:
1. Сам генератор с полями и выбором предусатновленных значений
2. Страница регистрации и входа (через аккаунт Гугл, Яндек и почты) /
3. После входа будет доступна админ панель, где будет история созданных ссылок, а также возможность добавлять свои шаблоны меток, поэтому нужно сформировать базу данных, которая будет привявзываться к id пользователя.
Дизайн сделать похожим на тот, что прислал на картинке.

Пишем на React
Нужно параллельно сделать и мобильное приложение для macOs, android, ios, поэтому нужна и мобильная версия приложения с адаптивным дизайном.

Пример предустановленного знаячения к каждому полю меток
utm_source  - Имаг-alpinabook
utm_campaign сделать 2 поля предустановок - название кампании (вводится самостоятельно) и даты (месяц и год) для ввода в календаре (выпадающая табличка выбора), которые подставятся в формате [название кампании]_[месяц на кириллице_год]
Значения не обязательны для выбора, пользователь по итогу сам может прописывать их.

Название приложения utmKA
Шрифт - Droid Sans Mono.
Основные цвета:
Фон #FBF4F4, главный цвет для элементов #9e5151, Втоичный цвет для элементов #834944

Сделать панель переключения между страницами как на примере слева. в десктопе сделать как кнопки в шапке, в мобильной версии - внизу в виде меню-бара (переключателя с анимацией)

Нужна кнопка для копирования сгенерированной ссылки.
Итоговые данные должны быть на латинице.
И еще момент - напиши это как подробный гайд с шагами, которые мне необходимо сделать поэтапно для реализации проекта. Учитывай, что я ничего не понимаю в разработке и мне требуется больше информации по тому, где вызывать команды.

Как выглядит логика страницы генерации ссылок:
Нужно добавить поле ввода ссылки - она будет заменять стандартную https://example.com/
UTM_source и UTM_Medium нужно разделить на два поля (каждую). Левое поле для кастомных значений для ввода пользователем (если он хочет написать его сам), правое поле с выпадающим списком заранее заданных значений.
Если пользователь в выпадающем списке выбирает определенную метку, то ее имя должно зафиксироватья в поле выпадающего списка и быть пемечено галочкой
Например если в utm_source выбрано "Имаг-alpinabook", то "Имаг будет названием в выпадающем списке, а "alpinabook" будет значением, которое подставится в итоговую ссылку.
также в поле "Month" месяцы в интерфейсе нужно подставить русские, а в метке указывать на английском
Кнопку copy прописать как "копировать".
Все поля и кнопки тоже сделать на русском
В истории к каждой ссылке добавить кнопку копировать (должна копироваться только ссылка, без даты генерации). Дату генерации выполнить в виде некликабельной прозрачной кнопки с border=2px, шрифт сделать меньше основного на 3px и цветом #834944. Кнопку копировать поставить правее даты.
  
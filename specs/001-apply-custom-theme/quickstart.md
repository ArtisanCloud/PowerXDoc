# Quickstart: Customizing the VitePress Theme

This guide provides instructions for developers to apply custom styles and replace the homepage in the VitePress documentation.

## 1. Applying Custom CSS Overrides

To make simple, site-wide style changes, follow these steps:

1.  **Create a CSS file**: Create a new file at `docs/.vitepress/theme/style.css`.
2.  **Add your styles**: Add any valid CSS to this file. For example, to change the primary brand color:

    ```css
    :root {
      --vp-c-brand: #ff6347; /* Tomato */
    }
    ```

3.  **Import the CSS file**: Open `docs/.vitepress/theme/index.ts` (create it if it doesn't exist) and import the stylesheet:

    ```typescript
    import './style.css'

    // You can leave the rest of the file empty if you are only applying CSS changes.
    ```

4.  **Run the dev server**: Run `npm run docs:dev` and you should see your style changes reflected on the site.

## 2. Replacing the Homepage

To replace the default VitePress homepage with your own Vue component:

1.  **Create your homepage component**: Create a new Vue component, for example, at `docs/.vitepress/theme/MyAwesomeHome.vue`.

    ```vue
    <template>
      <div class="custom-home">
        <h1>Welcome to My Awesome Homepage!</h1>
        <p>This is a fully custom homepage experience.</p>
      </div>
    </template>

    <style scoped>
    .custom-home {
      text-align: center;
      padding: 4rem 0;
    }
    </style>
    ```

2.  **Configure the theme**: In `docs/.vitepress/theme/index.ts`, extend the default theme and register your component.

    ```typescript
    import DefaultTheme from 'vitepress/theme'
    import MyAwesomeHome from './MyAwesomeHome.vue'
    import './style.css' // Don't forget your custom styles

    export default {
      ...DefaultTheme,
      enhanceApp({ app }) {
        app.component('home', MyAwesomeHome)
      }
    }
    ```

3.  **Update the homepage frontmatter**: In `docs/index.md`, set the `layout` property in the frontmatter to `home`.

    ```markdown
    ---
    layout: home
    ---
    ```

4.  **View the result**: Run `npm run docs:dev`. The homepage will now display your `MyAwesomeHome.vue` component, while all other pages will continue to use the default theme layout.

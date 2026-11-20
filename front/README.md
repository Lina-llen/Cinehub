# React + Vite

## CineHub visual identity

The interface follows the CineHub palette: Nuit `#190F33`, Aubergine `#2B1B55`,
Crème `#FFF4DC`, Popcorn `#FFC633`, Framboise `#FF3E7F`, and Menthe `#35E0B5`.
Global Bootstrap overrides and the locally bundled DM Sans and Unbounded fonts
are configured in `src/index.css` and `src/main.jsx`. Calendar-specific styling
is kept in `src/Pages/CalendarPage.css`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

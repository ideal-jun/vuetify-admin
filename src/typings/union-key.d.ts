declare namespace UnionKey {
  /** Theme scheme */
  type ThemeScheme = 'light' | 'dark' | 'auto';

  /** Theme layout mode */
  type ThemeLayoutMode =
    | 'vertical'
    | 'vertical-mix'
    | 'vertical-hybrid-header-first'
    | 'horizontal'
    | 'top-hybrid-sidebar-first'
    | 'top-hybrid-header-first';

  /** Theme scroll mode */
  type ThemeScrollMode = 'wrapper' | 'content';

  /** Theme tab mode */
  type ThemeTabMode = 'chrome' | 'button' | 'slider';

  /** Page animation mode */
  type ThemePageAnimateMode =
    | 'fade-slide'
    | 'fade'
    | 'fade-bottom'
    | 'fade-scale'
    | 'zoom-fade'
    | 'zoom-out'
    | 'none';

  /** Login module */
  type LoginModule = 'pwd-login' | 'code-login' | 'register' | 'reset-pwd' | 'bind-wechat';

  /** Menu type */
  type MenuType = 'directory' | 'menu' | 'button';

  /** Menu status */
  type MenuStatus = 'disabled' | 'enabled';

  /** Yes or no */
  type YesOrNo = 'Y' | 'N';
}

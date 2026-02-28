declare module 'react-native-dynamic-app-icon' {
  interface DynamicAppIconModule {
    setAppIcon: (key: string | null) => Promise<void> | void;
    supportsDynamicAppIcon?: () => Promise<boolean>;
    getIconName?: (callback: (result: { iconName: string }) => void) => void;
  }

  const DynamicAppIcon: DynamicAppIconModule;
  export default DynamicAppIcon;
}

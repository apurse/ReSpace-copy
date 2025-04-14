import Icon from 'react-native-vector-icons/FontAwesome5';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../../app/_layout';

// Status icons

export const ThumbsUpIcon = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="thumbs-up" size={30} color= '#fff' />;
};
  
export const WarningIcon = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="exclamation-circle" size={30} color= '#fff' />;

};
export const StopCircle = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="ban" size={30} color= '#fff' />;
};

// Status battery icons

export const BatteryIcon = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="battery-full" size={30} color= '#fff' />;
};

export const BatteryIcon3Q = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="battery-three-quarters" size={30} color= '#fff' />;
};

export const BatteryIconHalf = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="battery-half" size={30} color= '#fff' />;
};

export const BatteryIconLow = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="battery-quarter" size={30} color= '#fff' />;
};

export const BatteryIconNull = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="battery-empty" size={30} color= '#fff' />;
};

export const BatteryIconCharge = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    return <Icon name="charging-station" size={30} color= '#fff' />;
};

// Star icon

export const StarIcon = () => {
    return <Icon name="star" size={20} color="yellow" solid />;
};

export const StarIconOutline = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    return <Icon name="star" size={20} color={isDarkMode ? '#fff' : '#000'} style={defaultStyles.starOutlineIcon} />;
};

// Search icon

export const SearchIcon = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    return <Icon name="search" size={30} color={isDarkMode ? '#fff' : '#000'} style={defaultStyles.searchIcon} />;
};

export const UserIcon = () => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    return <Icon name="user" size={30} color={isDarkMode ? '#fff' : '#000'} style={defaultStyles.searchIcon} />;
};


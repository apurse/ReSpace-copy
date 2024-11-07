import Icon from 'react-native-vector-icons/FontAwesome5';
import { styles } from '../indexComponents/styles';

// Status icons
export const ThumbsUpIcon = () => <Icon name="thumbs-up" size={30} color="#fff" style={styles.statusIcons} />;
export const WarningIcon = () => <Icon name="exclamation-circle" size={30} color="#fff" style={styles.statusIcons}/>;

// Status battery icons
export const BatteryIcon = () => <Icon name="battery-full" size={30} color="#fff" style={styles.statusIcons} />;
export const BatteryIcon3Q = () => <Icon name="battery-three-quarters" size={30} color="#fff" style={styles.statusIcons} />;
export const BatteryIconHalf = () => <Icon name="battery-half" size={30} color="#fff" style={styles.statusIcons} />;
export const BatteryIconLow = () => <Icon name="battery-quarter" size={30} color="#fff" style={styles.statusIcons} />;
export const BatteryIconNull = () => <Icon name="battery-empty" size={30} color="#fff" style={styles.statusIcons} />;
export const BatteryIconCharge = () => <Icon name="charging-station" size={30} color="#fff" style={styles.statusIcons} />;

// Star icon
export const StarIcon = () => <Icon name="star" size={20} color="yellow" solid />;
export const StarIconOutline = () => <Icon name="star" size={20} color="#000" style={styles.outlineIcon} />;

// Search icon
export const SearchIcon = () => <Icon name="search" size={30} color="#000" style={styles.searchIcon} />;

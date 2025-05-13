import { useState, useRef, useEffect } from "react";
import { View, Text, PanResponder, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from "react-native";
import { useTheme } from "@/app/_layout";
import { createDefaultStyles } from "@/components/defaultStyles";
import ActionButton from "@/components/settingsComponents/actionButton";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { useSocket } from "@/hooks/useSocket";
import FurnitureModal from "@/components/LayoutComponents/furnitureModal";
import { FurnitureItem } from "@/components/LayoutComponents/furnitureModal";
import Icon from 'react-native-vector-icons/FontAwesome';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from "@/hooks/useAuth";
import { useRoom } from '@/hooks/useRoom';


// Get dimensions of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


// -------- Grid Visuals --------
const roomDimensionsMM = [1200, 1200];
const gridWidth = roomDimensionsMM[0];
const gridHeight = roomDimensionsMM[1];

// const initialZoom = 0.5;
const viewGridWidth = 350;
const viewGridHeigh = 350;

// Dynamically calculate the initial zoom level based on the room size and screen size
const initialZoom = Math.min((viewGridWidth + 150) / gridWidth, (viewGridHeigh + 150) / gridHeight);

// Calculate the initial offsets to center the room in the grid
const initialOffsetX = -(screenWidth - gridWidth * initialZoom) - 350 / 2;
const initialOffsetY = (screenHeight - gridHeight * initialZoom) - 800 / 2;

// Boxes in the grid
const allBoxes = [
    { furnitureID: '111', id: 1, x: 0, y: 0, width: 70, length: 30, color: 'red', rotation: 0.0 },
    { furnitureID: '222', id: 2, x: 150, y: 150, width: 50, length: 150, color: 'green', rotation: 0.0 },
    { furnitureID: '333', id: 3, x: 100, y: 100, width: 50, length: 30, color: 'blue', rotation: 0.0 },
];

export default function DragAndDrop() {

    // Define 'Box' to store in 'currentPos'  
    type Box = {
        furnitureID: string;
        id: number;
        x: Float;
        y: Float;
        width: number;
        length: number;
        color: string;
        rotation: Float;
    };

    // Hooks and colours
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    var { isConnected } = useSocket();
    const { user } = useAuth();
    const { roomName, jsonData, updateJsonData } = useRoom();


    // Back-end settings
    const [hasBeenCalled, setHasBeenCalled] = useState<Boolean>(false);
    const [notifications, setnotifications] = useState<string | null>(null); // Notifications
    const [isModalVisible, setModalVisible] = useState(false); // State of furniture modal (to add furniture)
    const [isCurrentLayoutSet, setIsCurrentLayoutSet] = useState(false); // Check if the current layout is set or not
    const [isSaved, setIsSaved] = useState(false); // Check if the layout has been saved
    const [loadedLayoutIndex, setLoadedLayoutIndex] = useState<number>(-1); // Check if the layout has been saved
    const [duplicateNumber, setDuplicateNumber] = useState<number>(0); // Check if the layout has been saved

    // Box positions
    const [inputX, setInputX] = useState(''); // Value of input box of 'x' coordinate
    const [inputY, setInputY] = useState(''); // Value of input box of 'y' coordinate
    const [inputAngle, setInputAngle] = useState(''); // Value of angle of the rotation furniture
    const [boxes, setBoxes] = useState(allBoxes); // set boxes array
    const [placedBoxes, setPlacedBoxes] = useState<Box[]>([]); // Placed boxes of current layout
    const [selectedBox, setSelectedBox] = useState<number | null>(null); //Track active box for highlight feature

    // User settings
    const [rotationInterval, setRotationInterval] = useState<NodeJS.Timeout | null>(null); // Track rotation interval
    const [currentSpeed, setCurrentSpeed] = useState<number>(50); // Initial rotation speed
    const [layoutName, setlayoutHeading] = useState<string | undefined>();
    const [zoomLevel, setZoomLevel] = useState(initialZoom); // Check zoom level

    const squareRef = useRef(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);


    // Local room json file
    var { selectedLayout } = useLocalSearchParams<{ selectedLayout: string }>();

    jsonData.roomScan = "iVBORw0KGgoAAAANSUhEUgAAATkAAAGsCAAAAACDIY/dAAAX+klEQVR4nO1dCa7jIAz1oH8hi/sfAXEjNLJZQhLIBjQU+mbUpkmb5X0bLxj4p2AKyOrPKWBcSJBh21Q/+7+hZU4CAD8g6urnHlnmAJWpL2tTyBwCaJAqSF5VDC1zQOQZNg5Li1cLfzAuUCO9GEEqK0j0akre0DKHoMkyGBCgAVRdjR25nUMAILEDYUhAFOlsvccdWubAuSOkrwokWvIqNXp/g1tW5E0j6J8GNELViibGljnkto62tBEkamws6kCMr6xIQieFMSDBaKkAycwWa6wY2z6AhyFlpac1EgQoWa6zA7dzDNvOEQx5J8JoEjkD5d7d2MyhNxEOBoRhx9iAQlLcAoiRWzgNuCKOrSwoYYSgJy+TuWGZgy1nDgZQCWM0mYkiKzEuc0Byl0jLsVcnKAVVZl5HZQ6Zs52yuiNGSXrlz0/5E0NHEAlYm4EGBbCBpbAMnkDMpqxI+zRoUFKgkszdI+pGzZVgZj/nTtyGKPJMxMABhIasyPFjG5kleF7mCJhv5cAIFAIM6exTIzEwc5AxrGw5FBjFH8mte9TQiamUVVuR00tzR+/qUTQxJHMYXrYHLJvoCRSSY4l1OcDMzGlIU8cip6MPSjF1EhRr7C32/sZNzWGmG3H5oMlUcIMXvLrrfTxDylxGWYPIcRqFiNOgjSIKSPAMdSuay9ZiWOYgIXL+xW8wedTQoUZmUN5wjcWwqbkdbE+O+8D2Fa3+KiJQI0ncjeTTiNEX0kvwO1LQQeBIhfndcsoaPK3MYfQaYceIJpELZFHGThKdV9u5YWXuGFbMnNzZTUn92RqQesaoFkBNKnN6u1dvjCw1dMFK0Bt17QjkeOwKcSMyl5a7eAcR5pwSb2a5O1vbPsVrRmJU5rZYIgdOazq7uugqH5MCiUsi7tyt+ybmZEEr5+lxMsZGISLOvhjeMteu9T3MyZKuKuty2G1SUud8rCQONaXtfDkAXVB+G3OSWVrfN3+K96yfSl4QueWDxqiR81EZk8glilwbC9Ic9+3055XIZVOtdpIubb6XuPkkcwm3OGrk/EfeEFxC4Qg8KrbrjjkZfwg3J23rs/Y1bNG5itIbjuBDkLTZ4MHGXvEB/1FQafHmFnpnTq4++aEM0tERmKNKJGk0E7d4X1Qbd34J7wM74paXNSx16qvauQUuZSZTN0tsUuu3tEbSXOrK8sFDVIKdDHJPbGxfzEl3o2uNoypVuk+uV/VUGgNCKmVASiUNHyAZPAa5cvxiG7nYrG6ZcHWxrib7W7TVuOfghtq+2KPCaaVnlvqakR7SJToo6rxWCex1lbfX7d0CHgtg24P0wc5gAnF+M4x7CzU0fFwIhULa5lwycVwNfA4ndf6T7dDJUCNzPWO9yRzyK7HldkSbTrk4qeH0iVgzXOgQDHAkotla9FjKjhJ5R1aiQ5kDEjKT2LSwtfnCtnzsPXBal3TY8hn9gqozxf4Z40bOpzIPiJBfIXNwaB61jcWdDrPH6ppBSq/lZWx9EgrrbRY4vljyp8xnuqHrTub00R3ZEIy1lGyroXppbga1VLR38/TimDiqS4zq/iHvmchvYO4QHIo7A0LixrXmHJ07Rd18ff90ZBqcdcg6cnukck79MWcOjgnJXoeNLRf90n5n4lximy9Z9dGcEpeviO2POX0qdJ4ja1sBBFeImP1jCdJfscuyB8N6pZvLO8Syf+YOwVaVldIyYhs3TX6c2D2vYIeQzKu3r9Ym+D7Ca6pqmzrqjd3cCnwVjH1bfDbmkY2GP+SfyEsmfcGQ9AmgZLmVuOvEhbN175XAcduzdoydtu72sNl1fjJv8yc6QG7zbbgR2fudnUGfEGcNK3+yhETEOb+E9NSKJXl8TuTskWAfLs/94qKwbUvXocxBLHVrD80KUuAq7fd6dr228qtrBiODfB0+QZzc2y0Mte821HLPb/MAPu+9fNOGY1Q37UIwlkcWtcU54aN3Zxoy31N5KDamYOHHxvpu27u+VsiiJMCSLbBOSczvk9mtEh51p8wFLG1Y8OEcdY4ju883eK4NdCptDzTTqh6Zk37DP3TUOnlDGQTOR12su8ETsd8Tl+zzKdKn6bqdM5uUpgsibBYuzsGx5fS8uQRUvUdzV5L9M2dOgte1FpMR8c7J4n2cXuHmDe3J65E5fawggVgSKxY1m3EP4Vjyt2bB06de1+n0yJxc3Ve0FRlcZyWdTnL4uvl2ALkxq/zTY+pWPl2PzK1vLHZDAk/OVHi9TWuoF7FVcLY+5T2sWrpumTMne22r5p9g/xi7/ovlBF7H79+M7NwrOegWWAwqZHDNPkQezFP0KXOGLeZ2bzCbIRrb/GrTnp1c4glxsm+ZM1Yetk/G/VyZ1v0BC3Egd/kn0DdzOi6IWMDx64625ypXGL72qa2Q7ft8rJ27k6T+DMf3s/56l8zpNHHxvT4gzf4u3jIlDV2XzG0RZehKWKsA1XlOGKJqLt/k+dzmSze0/OFU1zInRRA0L2CkXFQR8dIduW6NSOh6tK0yI16P8rm1wCFyXIfcIXMyk75mVJyc9QHiQoK/LgVOXHMMPgl35aX3p8d2zhwcelXkVt1mf73m5gz0BduA0Kx1Xcqc7HdsZGhgk4Mz3ob0Gwfux5tuCfOnOtRW6d6PFPVFJbYZh+DQdSRzUl3g5V4uty5oZk47v2Rf0ZdcDbfJZmxLU7kl4Axhd9GXdJ2n5/ny19BnlknCd8B0x5xS2yqIDN7186JmthfmthFCV/cVYbnDXrwSuRGng3zSq0H/4pX8fXMrJz6rvFwxGqj764Y3s95JJXCZ74eyOldy+DEYXnFtcxdvQtHLqvgj0xXNx97Nmiza8dfPAPRrf03XwewUNZ8CbY73ZU6qLHHpGojo9dMwUUfE+8wpCrsyxy7c3UcfoK/qCJnYF4rOO0PcOLwuc7JHhrKIB0p1Zh2+B+8yJ48auUswrw/W6Ig4c/HXYmqZg3TJkuj2zmkYche21ST2XPRul7FL8EEs9/Ymc1I9e+w3E+rLn/VFbZUKpUqNNT3jZTss5IOI6HpP5iQgSVxqBYx+EbUkr3vCuEy8citVLTroQ3wHUvnuVbcG95Pm69Xs8FsXVtG6Uo67WzwsKZOPPkIvPSU64u5Wlf1roCVfeunjR/vGOf6lqvpwaLB5z0cRoSPi/T+z1ruRWCdUrIa5frat04bWkewkPwc8m/SuA+eUkP2I4Q/PQQNdQLuFQR2uUPF24WsnzMHtiWtex/sWIqMKsfk/lq5PmohaFdaSaL+8QNYp7gZibtLI1LRXlaEbyxw+43A95+yySoPHQV+/nV9u3ed4a8Tv8XcPn6embdV+w8dTl2Dn7Y5OwssgxWUP8WSkibFYm3xeecut32zncFlD9cp97GdcXc+CY9+zsrfu574jcqsv684sBDqHzc+rmhPJsJQPf9jPArZFTi1vKSudW/dvW3Gtk3ZFld03dLx8S5hPKIF4WnrzkDn1dV4Jbj5vJ0der8uYZS5VyH5p6vRwJf1dzEn3cGHpsgXuSXCp9kqH/yJ76EY54lKi/zUyJ/mqlrT0NLU0K/8Rcww7Yf/mcGL8sKBFEGrHKS9pq7wkF3nBWr6wsxN24QOeEcY/m1t5oy7eYk4ld+/Ez017fih0yV9s9fDy8tOX8VaWCZN795p72a8N05V6QeWrhGZzqYz+9ohfuuvmIlXnAi66l8b+mJ2Xzo7PitYIKnRBemLO7Be5XMVv9rOzsbnRcztWo2X19tFBXY19UeZwFVws2KyKdNbQJYSO390iYPEZq0rdaxYCk04CJlJOh9OUuJWEoh12nteNr+LsbE2pe9OfOwrOok9p5vxc1ttjbt70XRqgOnd95IQx/hCaPl51D20kdoM6Xlho2/7Vp+595jATUdrR38ygO5ZOjewO2DTxXhS9Z1yJu3d7DTHaXlInPlRSGx/vIJaPDyW/xZ5KVeP6Xt8XAq1UtiwOiq7L2u2Nhe+QkuRDJGbJJXY5Fj5fML5jmUNaRpWXeXPWIGSEFzL3yMtcNDDRbiST79T+1ZO6v9dYA1oezxrRneMV6a2tcvIrZJznCWxCNJ2X4rWtvtJCYDCbbmXydT/FLpTwqzbGoejWU4vtx9KFmEigsL3V9Wzr30dFDXxXDdO2TqfHTnAAa1dYEoj3bEXPN3Qrfd3KHPWl0dx7Co8Wiu+3H0L7Bd1ZSzMxFxEXMp+CgrTzOYRthOacuHQno3Pz6j3up5hDXsQy8OWWno2Oe+9jJYX2FztbmEyh2yOOthR1blqFb9JW1Mt/T9zaeC6Lgm7V9wJru29Eq0DGCuyXex0mhgCWLWcvIuISnOUzdYEQK3Q7kVsWo6umsK2ZQ7/ee/YLUVpEZ1gLPGSpW5jjT7kvsTh2y5wMZwxtWv7LbuVjEjhJLsP2+E52zpgLLV36W2Ed9a/SVtRpNc1Mg5uJ768wl4X1b7plTl44JSeOhLpDmkVenI5+7c0tf6tbbXVI6ai0t30QcZ/XVZ8yZ44q7aBvr0TSzWUat4Rfm/Nua5Ve0hKRHEKwT6Jq1ZiKT09rKPbrYmRWyHh0a5kTmUymvlsLISkfbpNi8Zy3l36bNgZnJiLTyIVMsddWK3klMWyTGEKG4rcgN0vbdlUJq7n7NruyuSzHdUX+SQuZk4dT7zUqwc/XKEYhRcWwtYXMyYSxazZGa59xOl7ZS919EvU55mS0HW75CWVXMsBhSARfJCHlqxJ33yl0BbZC/lPaKiMVrS1eR50QTqp36eJFUfntsjuy9LbRi2otc3LtSNQeCZM/3eGFPHWU/ZOXRO6qy1LCnHQ3Ij9mBo6R7Crk2EHZCqBTLzjJWobwAm2V6SzifdLqiGeq8jXk2RWnYg4TN0nW3MOpqsxJe0/vi9o5c6uKzRR3WQ1tx1wfpF1gLs/dYbvmBUO1sRAGOlwa18FaewE66i3UvJxNvHbXGVLiVcqcKfx91SsfuF9SWeqWNqY07C9jznQzmP2CtYnc8rv3ncoM9DB3RB2kl8sNR9fvN1Ulpa3PhUZBZzhanLSwUZFVmZPwHeBFOAt+nENZQyX6mbWj3cQm531GdZYKHQ+iMnMKJkdD2yrGlsh27ZSAsdHSKzEDiJx5QVsNjA0xmE6KAa/0GZhvYE7BBBAtmJMwAQ6Gmn30Pr4WyeUYhoJo9DyqQTsnYAYLMb7MmVYnlqMz1wyqV+YEfB1KblnZM8TFJOL7iVuv43kwR2VVETbPzvPmwjabxU/F9l6y3WQVIn4TXfvRCSqWPUU1wbd+tmxuCmPzPYw99BqaegX80eudX9jbSE/r3FDmIqymAb6BatS5YQKXrrn9lXuP/o5uNgXRoGZT7m701YXLr97DelmA9ZzPS2VPNOY/1cdfWO0q7cW/BqmB7WElFK+u9MHNXmd31K48/C7mNoV+dno/W+lkEqPWz+dwmoA5sd3hFTSekNMuO8BF2BcH5gzOnFh/DBMk2Nl09yOsbwxn6sEraYVEBTOXXIMxFCfwH3zD1A05Kh0PIav6Y1UQzbVpET6HeSRJ1EpnfKmhrdCNviY8r8UbWz1p+Uw5o2irODqYmFGovPtJVMn3CXgRNk5PQRmjBBjVpJuujrbCS+Xp2SM8R5PzYGmmzgbUfam2iuwRMlc0d5FC7elqQlxp3KpKTcR9s5wjjUca+vFxqwEjTYgrlDlV3FttijhTbjQXQfPMEKnfXZk/RX28nVP7dEkJMosCJfbRLDHqaCpnJ3RtBK5COyftWy1fODNuaw3HxY4SP3/ucjOyjVmtFkMQnjN3sITcHsd3uxW6ZvJWZdyXKL2D9KwkW1yKlnhWsfCnoDXEG6KSPwd1exJWuHGHIRn5gVVNC2VOyZZ2QPVc1lfInKwyuK0SZ6t1dOotjtpY5sRtxyxMlrE5Y9kN8bSxfgNaoni+EunebzCXCc+hBngaRft3aSx0PcStqurZrH3lzivdNXPqUVPH80Q2as4dcdu5nvuTOfXMSjQygRpJ6NyqrE25eyMnaRqf388j3lboxBsnMg25qzUZ5CeYUw9+0/jh3IIdTa8iXjoTQkM0j7xqMafcqfqoWSV586vEtPz7VHladfuqQjQd+5RYPLw6xDu1uNAwMLfr1mNroasaQwhz9W/UOqFhM3VNUWWeTcxPSZsgrWmmlm/Hb+xX2+lM5qS6JWjNE2gcfpnWQldF5iS/budVjT9Ey9B+ANTC8aLELYWunoUwyzlDpYcBpdTRTFNtwOtebRYp6tkTDgjz7/Ps0Z+Jhbagv5Uk16eZzlb3Sozj7G1wqsnVAPfPnMlT9slmjq4mLG8SoO6qrZX9OXVQaP2Osnqodqa8jswptYlb3Sq2r8GvctvyEm1OhruNz0K1jyprXUFZsXOfXpY4VtPWDnfFv43qjLrGEE3OhzA+/r66L+BN1JQ54/2SPW3va2/PModhFvcBeWrInOTe4fGVtIm26s372KiorZrXFIVZUE/mdOxDTaC11WROhZc1WnekvIYG8Z2+tOvrUZk5vLBnEPRR0fCN+DHXB3Po15QduoX7jMwhjIqftj7Fj7kumMOhG7YNfjL3FD/memAOdxsOQ2pwbZnTMAt+2toBcwhT4Sdz7zOHMBeqZtPBzU2TODAeRHuRwzGpq8aczu8fU49/7VwftlXDPPiEV6JhRDSwEDg+a5+ROQ1jQjQnCWFM1Jc5hDkgWvOFP239oTFzeLpjELSo2dzsGlRdKzGHu43EsbHwa+ee4sdcB8zpzBiSXzt3AIT58NPWfioPZxHHKswhvei5gq+ftvZTPzeN0DWXOQ2DQlQUNTw8Ohqa97fiqELX3kIgjImaVWA6ue8nc1ngbmMK1JI5fWPvGKhYV6JhKvyqXd9jDmFOiNbKqmFQVGJOzyd71fr4NUyGYuYQJsUHKqwHRR3mdFZZxyW0lDksOPrdaF4FNiwq9bfqzIGBLe6vB+cl5vBkwq+B3bzKdSUToWI7hzAVqjCnef0UmAtlzGFmewbUqSvR8zVz9ern9E/m7kPTy2zElTGHEytrvfo5TB0YmU5Rc9KIqSAqKet8qFkFNhd++bm327n5IOqUamqYDuUypydbi6T+eIjZUKUiR2ePDazFz5nDsJUN9gfm7efPPcev7+tNf05PKYyizgxWGqZDpXYO00dGJvQxczpsHNEzsL4+ZQ4nHT/yqZEkI+OvEmUIs0GUyhhOSFoJc7iZTHM+ZS3WVj2t3LWtEx4ZNbJMekJdfaqteLUwYmBO61S7zogao5f0yKLViDntTeuE1D1iDvMb86CCV6InFLhS5rQtnDtYyAXGRXnlIeLRSi7j4glzkSTZTPrIotVIW8FXR0yIEub0SS/E2HjA3MyuSDWZQ7KvM7rBFfw5XXB0ck8YYVKIkgwTDi5WzbUVYUaUx604qdSJwgDiCGNT+rzvS4eXOVFzhtIdhm4AC8dDIEyLu8zt1qDGWRW2rH5Ow7wQRSKHMC9qjIeYEyVVYPosghhamYvGVGuYGEVV/Tgze6KgEgemZa1QWzW/4qw25O/5uBuEqfFQ5nTt+5iFOe19knkNxC1t3SirXu+bDRXmjpgUj7VVz6unt5lbyxjObiVuMBcxhT9lLczP4flXhsUjbdWjs1Jb5qLxhTB9M3eduW2ZHMLkuMxcJGI/n+QWc+sIAje7JkT53BGzQjwM9/Ha9wZGSZ3w3LhjW3+oEPHjhYrDwbkWz6pJdJu7GY+5DVF4SZ4GZ/eqtg6ueh+q2XSlX5OT+WysoW5w1m/Ds2fEk+NmAu4uPuF6GiY8bfwFCJASRsaDdu6aT2KEgqHxPPrCo58aM7y6PvKEo8ZseIKyuP/k2udJBBhSysxZlYGxcYm5TRrdNXOKf5yiThgh5OjSWDRznwkvEQRzaQaPvR5oq1dWzCQ3mThySkbH7Yg/KCumz2V2Qjgxc8nUiPBsChYw+m+cqBkDanBn7oG26nWAJUDQhttk/gjj83aJubXA+eZNI2klNWrKM+gwA23XbOvCCRsGK1CSwisUJnglivdL2jkHdRdkbuOxWV6UIo5YQRX9Mza8VwCTEHfGnCQpi6iIKjUV+brEGr94vmh77BzJReZUPJmLALG0eZJIYnFL/mh8XNBWcjsEex2xq6ZI6uKPnq85JA7g35mAoAZ0AdXw3Vl1basgC8GSKcBMPHDkvrYqZb/CXtv40eh1XOGCnA4yB4ZjqlnasQrMkSEQIP0YrzksZwULwZDKytqPtbvM/bDHr81/ih9z8BD/AXauwO+N1uXaAAAAAElFTkSuQmCC"


    // Refresh layout on selected layout change
    useEffect(() => {
        console.log("useEffect called")
        if (!hasBeenCalled && selectedLayout != undefined) {
            loadLayout(selectedLayout);
            console.log("selectedLayout:", selectedLayout)
            setHasBeenCalled(true);
        }
    }, [selectedLayout]);


    /**
     * Load the layout from the selected layout in the library.
     * @param selectedLayout String - The selected layout title in the library
     */
    const loadLayout = async (selectedLayout: string) => {
        try {

            // Set the title
            setlayoutHeading(selectedLayout);

            // Get the layout index within the JSON
            let layoutIndex = jsonData.users[user.username]?.layouts
                .findIndex((layout: any) => layout.name === selectedLayout
                );

                
            // If no index is found
            if (layoutIndex === -1) {
                console.warn("Layout not found.");
                return;
            }

            // Get each box in the current layout and add to array
            var newBoxes: Box[] = [];
            jsonData.users[user.username]?.layouts[layoutIndex].currentLayout.boxes
                .forEach((box: Box) => {
                    newBoxes.push(box);
                });


            // Set all the boxes and the layout number
            setBoxes(newBoxes);
            setLoadedLayoutIndex(layoutIndex);
        } catch (err) {
            console.error("Error loading layout:", err);
        }
    };


    /**
     * Call function to clear the layout json entry from this device
     */
    const deleteLayout = async () => {
        try {

            // Get the layout index within the JSON
            let layoutIndex = jsonData.users[user.username]?.layouts
                .findIndex((layout: any) => layout.name === layoutName);

            // Remove the layout
            jsonData.users[user.username].layouts.splice(layoutIndex, 1);

            // Write the new data 
            updateJsonData(jsonData)

        } catch (error) {
            console.error('Error deleting json data');
        }

        setlayoutHeading('');
    };

    /**
     * Save the layout to the room JSON on the device.
     * @param oldLayoutBoxes The current layout of the furniture.
     * @param newLayoutBoxes The desired layout of the furniture.
     */
    const saveLayout = async (oldLayoutBoxes: Box[], newLayoutBoxes: Box[]) => {
        try {
            if (!user) {
                alert("User not logged in");
                return;
            }

            // Check the layout has a name
            if (!layoutName) {
                setnotifications('Please add a unique title to this layout');
                setTimeout(() => setnotifications(null), 3000);
                return;
            }


            var nameUsed = false;
            var newName = layoutName;

            // If this is a new layout
            if (loadedLayoutIndex == -1) {


                // Check that the provided name is unique
                jsonData.users[user.username]?.layouts?.forEach((layout: { name: string }) => {
                    nameUsed = (layout.name == layoutName) ? true : false;
                })


                // If its not unique, make a newName with (x) on afterwards 
                if (nameUsed) {
                    setDuplicateNumber(duplicateNumber + 1);
                    newName = (`${layoutName}_(${duplicateNumber})`)
                }
            }


            // Set the json entry for each layout
            const layout = {
                name: newName,
                room: roomName,
                favourited: false,
                currentLayout: {
                    boxes: oldLayoutBoxes.map(box => ({
                        furnitureID: box.furnitureID,
                        id: box.id,
                        x: box.x,
                        y: box.y,
                        width: box.width,
                        length: box.length,
                        color: box.color,
                        rotation: box.rotation,
                    }))
                },
                newLayout: {
                    boxes: newLayoutBoxes.map(box => ({
                        furnitureID: box.furnitureID,
                        id: box.id,
                        x: box.x,
                        y: box.y,
                        width: box.width,
                        length: box.length,
                        color: box.color,
                        rotation: box.rotation,
                    }))
                }
            }

            // Either overwrite or add the jsonData
            if (loadedLayoutIndex !== -1) {
                jsonData.users[user.username].layouts[loadedLayoutIndex] = layout;
            } else {
                jsonData.users[user.username].layouts.push(layout);
            }

            // Update the data in the provider
            updateJsonData(jsonData)


            setnotifications('New layout saved sucessfully');
            setTimeout(() => setnotifications(null), 3000);

            setIsSaved(true)
        }
        catch (error) {
            console.log('Failed to update/save data to json file:', error);
            setnotifications('Failed to save layout.')
            setTimeout(() => setnotifications(null), 3000);
        }
    }

    // work out new positions and timings
    const updateBoxPosition = (id: number, dx: number, dy: number) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.id === id) {
                    // Convert degrees to radians
                    const radians = (box.rotation * Math.PI) / 180;

                    // Calculate the axis-aligned bounding box dimensions
                    const rotatedWidth = Math.abs(Math.cos(radians) * box.width) + Math.abs(Math.sin(radians) * box.length);
                    const rotatedHeight = Math.abs(Math.sin(radians) * box.width) + Math.abs(Math.cos(radians) * box.length);

                    // Adjust movement by zoom level
                    const adjustedDx = dx / zoomLevel;
                    const adjustedDy = dy / zoomLevel;

                    const centerX = box.x + box.width / 2 + adjustedDx;
                    const centerY = box.y + box.length / 2 + adjustedDy;

                    const minX = rotatedWidth / 2;
                    const minY = rotatedHeight / 2;
                    const maxX = gridWidth - rotatedWidth / 2;
                    const maxY = gridHeight - rotatedHeight / 2;

                    const clampedX = Math.max(minX, Math.min(maxX, centerX));
                    const clampedY = Math.max(minY, Math.min(maxY, centerY));

                    const finalX = clampedX - box.width / 2;
                    const finalY = clampedY - box.length / 2;

                    return { ...box, x: finalX, y: finalY };
                }
                return box;
            })
        );
    };

    //Rotate clockwise function
    const rotateBoxRight = (id: number) => {
        let counter = 0; // Slowly increase for speed

        const interval = setInterval(() => {
            // console.log("Seconds:", Math.round(counter / 10), "counter", counter);

            setBoxes((prevBoxes) =>
                prevBoxes.map((box) => {
                    if (box.id === id) {
                        const newRotation = (box.rotation + 1 + Math.round(counter / 10)) % 360; // Degree incremention (1)
                        return { ...box, rotation: newRotation };
                    }
                    return box;
                })
            );
            counter++; // Increase counter
            if (counter >= 95) { counter = 95 } // Limit the speed
        }, currentSpeed);

        setRotationInterval(interval);
    };

    // Rotate counterclockwise function
    const rotateBoxLeft = (id: number) => {
        let counter = 0; // Slowly increase for speed

        const interval = setInterval(() => {
            ;
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) => {
                    if (box.id === id) {
                        const newRotation = ((box.rotation - 1 - Math.round(counter / 10)) + 360) % 360; // Degree decremention (-1)
                        return { ...box, rotation: newRotation };
                    }
                    return box;
                })
            );
            counter++; // Increase counter
            if (counter >= 95) { counter = 95 } // Limit the speed
        }, currentSpeed);

        setRotationInterval(interval);
    }

    // Stop rotation when button is released
    const stopRotation = () => {
        if (rotationInterval) {
            clearInterval(rotationInterval);
            setRotationInterval(null);
        }
        setCurrentSpeed(50); // Reset speed back to 50
    };

    const createPanResponder = (id: number) =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setSelectedBox(id); // Selected box to highlighted
            },
            onPanResponderMove: (_, gestureState) => {
                const { dx, dy } = gestureState;
                updateBoxPosition(id, dx, dy);
            },
            onPanResponderRelease: () => {
                console.log(
                    `Box ${id} updated position: `,
                    boxes.find((box) => box.id === id),
                    console.log(selectedBox)
                );
            },
        });


    // Set boxes to current layout
    let setOldLayout = false;
    const setLayout = (newLayout: boolean) => {

        // If new layout
        setIsCurrentLayoutSet(true); // Disable button function
        setnotifications('Current layout has been set');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec
        setPlacedBoxes((prev) => [...prev, ...boxes]); // Save boxes to new array
        // sendMessage({ type: "current_layout", locations: boxesFormatted })

        console.log("layoutName: ", layoutName)
        console.log("layoutIndex: ", loadedLayoutIndex)
        console.log("roomName: ", roomName)

        let oldLayoutBoxes: Box[] = [];
        if (!setOldLayout) {
            oldLayoutBoxes = [...placedBoxes];
            setOldLayout = true;
        }

        // Save the designed layout to the json file
        if (newLayout) {
            const newLayoutBoxes = [...boxes]
            saveLayout(oldLayoutBoxes, newLayoutBoxes);
        }
    };


    // Reset layout before setting current position 
    const resetLayout = () => {
        setIsCurrentLayoutSet(false); // Activate setlayout function again
        setPlacedBoxes([]);
        setBoxes(allBoxes)

        setnotifications('Layout has been reset');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec
    };

    // Add new furniture function - This is temporary, this would be change to a more complex solution
    const addFurniture = (furniture: FurnitureItem) => {

        // New furniture id = previous id + 1 or set to 1 if there is nothing else
        const newId = boxes.length > 0 ? Math.max(...boxes.map((box) => box.id)) + 1 : 1;

        // New box (furniture) in the grid
        const newBox = {
            furnitureID: furniture.furnitureID,
            id: newId, // change to "index"
            x: roomDimensionsMM[0] / 2,
            y: roomDimensionsMM[1] / 2,
            width: furniture.width,
            length: furniture.length,
            color: furniture.selectedColour,
            rotation: 0.0,
        };

        setBoxes((prevBoxes) => [...prevBoxes, newBox]);

        setnotifications('Furniture \'' + furniture.furnitureID + '\' has been added');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec
    };

    // Delete selected furniture function
    const deleteFurniture = () => {
        if (selectedBox === null) {
            console.log('There is not furniture selected to be deleted');
            return;
        }
        setBoxes((prevBoxes) => prevBoxes.filter((box) => box.id !== selectedBox));

        setnotifications('You have deleted furniture \'' + selectedBox + '\'');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec

        setSelectedBox(null);
    };

    //  Fix coordinates with two decimals after inputing a number
    useEffect(() => {
        if (selectedBox !== null) {
            const box = boxes.find((box) => box.id === selectedBox);
            if (box) {
                setInputX(box.x.toFixed(2));
                setInputY(box.y.toFixed(2));
                setInputAngle(box.rotation.toFixed(0));
            }
        }
    }, [selectedBox, boxes])

    //  Update X coordinate value with input
    const updateX = (e: string) => {
        let newX = parseFloat(e);
        if (!isNaN(newX)) {
            newX = Math.min(Math.max(newX, 0), gridWidth); // Set limit

            //  Update box X placement
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) =>
                    box.id === selectedBox ? { ...box, x: newX } : box
                )
            );
        }
    };

    //  Update Y coordinate value with input
    const updateY = (e: string) => {
        let newY = parseFloat(e);
        if (!isNaN(newY)) {
            newY = Math.min(Math.max(newY, 0), gridHeight); // Set limit

            //  Update box Y placement
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) =>
                    box.id === selectedBox ? { ...box, y: newY } : box
                )
            );
        }
    };

    //  Update angle value with input
    const updateAngle = (e: string) => {
        let newRotation = parseFloat(e);
        if (!isNaN(newRotation)) {
            newRotation = Math.min(Math.max(newRotation, 0), 360); // Set limit

            //   Update box angle
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) =>
                    box.id === selectedBox ? { ...box, rotation: newRotation } : box
                )
            );
        }
    };

    // Placeholders to show present coodinates and rotation
    let coordinateX = boxes.find((box) => box.id === selectedBox)?.x.toFixed(2) || 0
    let coordinateY = boxes.find((box) => box.id === selectedBox)?.y.toFixed(2) || 0
    let rotationAngle = boxes.find((box) => box.id === selectedBox)?.rotation.toFixed(2) || 0

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={defaultStyles.body}>

                    {/* Title */}
                    <TextInput
                        value={layoutName}
                        onChangeText={setlayoutHeading}
                        style={uniqueStyles.title}
                        placeholder='*New Layout ...'
                        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
                    />

                    {/* Show zoom value */}
                    <Text style={uniqueStyles.zoomStyle}>Zoom: {zoomLevel.toFixed(2)}</Text>

                    {/* Rotation buttons */}
                    {/* Rotation to right */}
                    <TouchableOpacity
                        style={uniqueStyles.rotationRight}
                        onPressIn={() => selectedBox && rotateBoxRight(selectedBox)}
                        onPressOut={stopRotation}
                    >
                        <View>
                            <Icon name="undo" size={25} style={{ transform: [{ scaleX: -1 }], color: isDarkMode ? '#fff' : '#000', }} />
                        </View>
                    </TouchableOpacity>

                    {/* Rotation to left */}
                    <TouchableOpacity
                        style={uniqueStyles.rotationLeft}
                        onPressIn={() => selectedBox && rotateBoxLeft(selectedBox)}
                        onPressOut={stopRotation}
                    >
                        <View>
                            <Icon name="undo" size={25} style={{ color: isDarkMode ? '#fff' : '#000', }} />
                        </View>
                    </TouchableOpacity>

                    {/* Grid */}
                    <View
                        ref={squareRef}
                        style={uniqueStyles.grid}
                        onLayout={(e) => {
                            const { x, y, width, height } = e.nativeEvent.layout;
                            console.log(`Square dimensions: ${width}x${height} at (${x}, ${y})`);
                        }}
                    >
                        {/* Zoom function settings */}
                        <ReactNativeZoomableView
                            initialOffsetX={initialOffsetX}
                            initialOffsetY={initialOffsetY}
                            maxZoom={10}
                            minZoom={0.1}
                            initialZoom={initialZoom}
                            bindToBorders={false}
                            pinchToZoomInSensitivity={6}
                            pinchToZoomOutSensitivity={4}
                            panEnabled={true}
                            movementSensibility={1}

                            // Set zoom center to user's gesture position (not resetting to center)
                            onZoomAfter={(event, setGestureState, zoomableViewEventObject) => {
                                setZoomLevel(zoomableViewEventObject.zoomLevel);

                                // Calculate the new offsets based on the zoom level
                                const zoomLevel = zoomableViewEventObject.zoomLevel;

                                // Get the current zoom position 
                                const gestureCenterX = zoomableViewEventObject.offsetX;
                                const gestureCenterY = zoomableViewEventObject.offsetY;

                                // Adjust the offsets 
                                const newOffsetX = gestureCenterX - (gestureCenterX - offsetX) * zoomLevel;
                                const newOffsetY = gestureCenterY - (gestureCenterY - offsetY) * zoomLevel;

                                // Apply the new offsets 
                                setOffsetX(newOffsetX);
                                setOffsetY(newOffsetY);
                            }}
                        >
                            {/* Internal room container */}
                            <View
                                style={{
                                    position: "absolute",
                                    left: offsetX,
                                    top: offsetY,
                                    width: roomDimensionsMM[0] * zoomLevel,
                                    height: roomDimensionsMM[1] * zoomLevel,
                                    backgroundColor: "rgba(255,255,255,0.5)",
                                    borderWidth: 3,
                                    borderColor: "red",
                                }}
                            >
                                <ImageBackground source={{ uri: (`data:image/png;base64,${jsonData?.roomFiles?.png}`) }} resizeMode="cover" style={uniqueStyles.image} />
                                {/* Display non-movable objects */}
                                {placedBoxes.map((box, index) => (
                                    <View
                                        key={`placed-${box.id}-${index}`}
                                        style={[
                                            uniqueStyles.robot,
                                            {
                                                left: box.x * zoomLevel,
                                                top: box.y * zoomLevel,
                                                backgroundColor: "transparent",
                                                borderWidth: 1,
                                                width: box.width * zoomLevel,
                                                height: box.length * zoomLevel,
                                                transform: [{ rotate: `${box.rotation}deg` }],
                                            },
                                        ]}
                                    >
                                        <Text style={[uniqueStyles.boxText, { color: "gray" }]}>{box.furnitureID}</Text>
                                    </View>
                                ))}

                                {/* Display movable objects */}
                                {boxes.map((box, index) => {
                                    const panResponder = createPanResponder(box.id);
                                    const isSelected = selectedBox === box.id;

                                    return (
                                        <View
                                            key={`${box.id}-${index}`}
                                            style={[
                                                uniqueStyles.robot,
                                                {
                                                    left: box.x * zoomLevel,
                                                    top: box.y * zoomLevel,
                                                    backgroundColor: box.color,
                                                    borderWidth: isSelected ? 2 : 0,
                                                    borderColor: isSelected ? "yellow" : "transparent",
                                                    width: box.width * zoomLevel,
                                                    height: box.length * zoomLevel,
                                                    transform: [{ rotate: `${box.rotation}deg` }],
                                                },
                                            ]}
                                            {...panResponder.panHandlers}
                                        >
                                            <Text style={uniqueStyles.boxText}>{box.furnitureID}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </ReactNativeZoomableView>
                    </View>
                    {/* Need scale measurement */}
                    <View style={uniqueStyles.buttonContainer}>

                        {/* Show notifications */}
                        {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}

                        {/* Show coordinates */}
                        {selectedBox !== null &&

                            <View style={uniqueStyles.coordinatesContainer}>
                                <Text style={uniqueStyles.coordinates}>X =</Text>
                                <TextInput
                                    value={inputX}
                                    onChangeText={(e) => setInputX(e)}
                                    onBlur={() => updateX(inputX)}
                                    style={uniqueStyles.textInput}
                                    keyboardType="numeric"
                                    placeholder={String(coordinateX)}
                                />
                                <Text style={uniqueStyles.coordinates}>Y =</Text>
                                <TextInput
                                    value={inputY}
                                    onChangeText={(e) => setInputY(e)}
                                    onBlur={() => updateY(inputY)}
                                    style={uniqueStyles.textInput}
                                    keyboardType="numeric"
                                    placeholder={String(coordinateY)}
                                />
                                <Text style={uniqueStyles.coordinates}>Angle =</Text>
                                <TextInput
                                    value={inputAngle}
                                    onChangeText={(e) => setInputAngle(e)}
                                    onBlur={() => updateAngle(inputAngle)}
                                    style={uniqueStyles.textInput}
                                    keyboardType="numeric"
                                    placeholder={String(rotationAngle)}
                                />
                            </View>
                        }

                        {/* Buttons */}
                        {/* Show different buttons depending in current location is set or not */}
                        {!isCurrentLayoutSet ? (
                            <>
                                <ActionButton
                                    label="Set Current Location"
                                    onPress={() => { setLayout(false) }}
                                />
                                <ActionButton
                                    label="Delete Furniture"
                                    onPress={deleteFurniture}
                                    style={{ backgroundColor: '#fa440c' }}
                                />
                                <ActionButton
                                    label="Add Furniture"
                                    onPress={() => setModalVisible(true)}
                                    style={{ backgroundColor: '#1565C0' }}
                                />
                                <FurnitureModal
                                    isVisible={isModalVisible}
                                    onClose={() => setModalVisible(false)}
                                    onSelectFurniture={addFurniture}
                                />
                                {(loadedLayoutIndex != -1) &&
                                    <ActionButton
                                        label="Delete this layout"
                                        onPress={async () => {
                                            await deleteLayout()
                                            router.back();
                                        }}
                                        style={{ backgroundColor: '#C62828' }}
                                    />
                                }
                            </>
                        ) : (
                            <>
                                {isConnected ?
                                    (isSaved ?
                                        (
                                            <ActionButton
                                                label="Ready To Go!"
                                                onPress={() => {
                                                    console.log("link layoutName", layoutName)
                                                    console.log("link roomName", roomName)
                                                    router.push({
                                                        pathname: "/extraPages/systemRunning",
                                                        params: { layoutRunning: layoutName, roomName },
                                                    })
                                                    // sendMessage({ type: "desired_layout", locations: boxesFormatted })
                                                }}
                                            />
                                        )
                                        :
                                        (
                                            <ActionButton
                                                label={(loadedLayoutIndex == -1) ? "Save the layout first!" : "Update the layout first!"}
                                                onPress={() => {
                                                    alert("Save the layout first!")
                                                }}
                                            />
                                        )
                                    )
                                    :
                                    (
                                        <ActionButton
                                            label="Connect to WebSocket!"
                                            onPress={() => {
                                                alert("WebSocket Not Connected!")
                                            }}
                                        />
                                    )
                                }

                                <ActionButton
                                    label="Reset Layout"
                                    onPress={resetLayout}
                                    style={{ backgroundColor: '#455A64' }}
                                />
                                {!isSaved ?
                                    <ActionButton
                                        label={(loadedLayoutIndex == -1) ? "Save Layout" : "Update Layout"}
                                        onPress={() => setLayout(true)}
                                        style={{ backgroundColor: '#00838F' }}
                                    />
                                    :
                                    <ActionButton
                                        label={(loadedLayoutIndex == -1) ? "Layout Saved!" : "Layout Updated!"}
                                        onPress={() => console.log("filler")}
                                        style={{ backgroundColor: '#00838F' }}
                                    />
                                }
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        title: {
            fontSize: 30,
            color: isDarkMode ? '#fff' : '#000',
            textAlign: 'center',
            top: -30,
        },
        grid: {
            width: viewGridWidth, // * scaleX once visuals are done
            height: viewGridHeigh, // * scaleY once visuals are done
            backgroundColor: '#D3D3D3',
            position: "relative",
            borderWidth: 2,
            borderColor: "#aaa",
            top: -50,
        },
        robot: {
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 4,
            backgroundColor: '#964B00',
        },
        boxText: {
            color: "#fff",
            fontWeight: "bold",
        },
        buttonContainer: {
            width: 300,
            top: -20,
        },
        notificationText: {
            position: 'absolute',
            top: 225,
            left: 0,
            right: 0,
            backgroundColor: isDarkMode ? 'rgba(255,255, 255, 0.7)' : 'rgba(0,0, 0, 0.7)',
            color: isDarkMode ? '#000' : '#fff',
            padding: 10,
            borderRadius: 5,
            marginBottom: 15,
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            zIndex: 1000,
        },
        coordinates: {
            fontSize: 12,
            color: isDarkMode ? '#fff' : '#000',
            textAlign: 'center',
            top: 10,
            letterSpacing: 2,
        },
        rotationLeft: {
            width: 25,
            height: 25,
            left: '35%',
            top: -60,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        rotationRight: {
            width: 25,
            height: 25,
            left: '44%',
            top: -35,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        zoomStyle: {
            position: 'absolute',
            fontSize: 12,
            color: isDarkMode ? '#fff' : '#000',
            top: 80,
            left: 35,
        },
        textInput: {
            color: isDarkMode ? '#fff' : '#000',
            paddingBottom: 0,
            paddingTop: 0,
            top: 10,
        },
        coordinatesContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            top: -20,
            left: '15%',
        },
        image: {
            flex: 1,
            justifyContent: 'center',
        },

    });

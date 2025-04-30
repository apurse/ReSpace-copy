export class Robot {
    robot_id: string;
    battery: number;
    locationX: number;
    locationY: number;
    current_activity: string;
    carrying: string | null;
    angle: number;

    constructor(robot_id: string, battery: number, location: {
        x: number;
        y: number;
    }, 
    activity: string, carrying: string | null, angle: number,) {
        this.robot_id = robot_id;
        this.battery = battery;
        this.locationX = location.x;
        this.locationY = location.y;
        this.current_activity = activity;
        this.carrying = carrying;
        this.angle = angle;
    }

}

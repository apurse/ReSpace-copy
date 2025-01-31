App -> Hub:\
Control movements\
	`{type: "control", target: "<UUID>", direction: "<text_direction>"}`\
Current furniture layout (manually set)\
	`{type: "current_layout", locations: "{{id: <int>, x: <int>, y: <int>}, {id: <int>, x: <int>, y: <int>}}"}`\
Desired Layout information\
	Furniture ID's with x/y coords\
	`{type: "desired_layout", locations: "{{id: <int>, x: <int>, y: <int>}, {id: <int>, x: <int>, y: <int>}}"}`\
Status control\
	Turn robots on/off\
	`{type: "power", target: "<UUID>", data: "<on/off>"}`

*(Possible: Send furniture types/sizes to be stored on hub)*

Hub -> App:\
Real current layout configuration\
	`{type: "current_layout", locations: "{{id: <int>, x: <int>, y: <int>}, {id: <int>, x: <int>, y: <int>}}"}`\
Robot Status\
	`{type: "status", robot_id: <UUID>, battery: <int>, location: {x: <int>, y: <int>}, current_activity: "<task_id>"}`\

Robot -> Hub:\
	Robot status\
    `{type: status, battery: <int>, location: {x: <int>, y: <int>}, current_activity: "<task_id>"}`\
	Current location of a furniture item\
		*(Either from just being dropped off, or scanned with ArUco marker)*\
		`{type: "furniture_location", id: <int>, location: {x: <int>, y: <int>}}`

Hub -> Robot:\
	Go-to / Move furniture to command\
`{type: "move", location: {x: <int>, y: <int>}`

Hub -> Swarm script:\
	Current robot ID's / Status'\
	Desired Configuration layout\
	Current furniture positions

Swarm script -> Hub:\
	Move robot\
	actuate_lift\
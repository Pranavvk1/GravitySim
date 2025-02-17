let pos = [];
let vel = [];
let acc = [];

let mass = [];


function setup() {
  createCanvas(550, 550);
  
  pos[0] = createVector(270, 420);
  vel[0] = createVector(-15, 0);
  acc[0] = createVector(0, 0);
  mass[0] = 10000;
  
  pos[1] = createVector(275, 140);
  vel[1] = createVector(15, 0);
  acc[1] = createVector(0, 0);
  mass[1] = 10000;
  
  pos[2] = createVector(275, 480);
  vel[2] = createVector(-80, 0)
  acc[2] = createVector(0, 0);
  mass[2] = 1;
  
}

function draw() {
  angleMode(RADIANS);
  background(0);
  ellipse(pos[0].x, pos[0].y, 50);
  ellipse(pos[1].x, pos[1].y, 50);
  ellipse(pos[2].x, pos[2].y, 5);
  
  for (let i = 0; i < pos.length; i++) {
    if((pos[i].x < 15 && vel[i].x < 0) || (pos[i].x > 525 && vel[i].x > 0)) {
      vel[i].x *= -1;
    }
    if((pos[i].y < 15 && vel[i].y < 0) || (pos[i].y > 525 && vel[i].y > 0)) {
      vel[i].y *= -1;
    }
  }
  
  collide();
  calcAccel();
  
  if(keyIsDown(UP_ARROW)) {
    setVel(100);
  } else if(keyIsDown(DOWN_ARROW)) {
    setVel(10);
  } else if(keyIsDown(RIGHT_ARROW)) {
    normalAccel(true, 80); 
  } else if(keyIsDown(LEFT_ARROW)) {
    normalAccel(false, 80);
  }
  
  if(keyIsDown(79)) {
    orbit(findClosestObject());
  }
  
  if(keyIsDown(68)) {
    setHeading(-3.13);
  }
  
  for (let i = 0; i < pos.length; i++) {
    vel[i].add(p5.Vector.mult(acc[i], 1/60));
    pos[i].add(p5.Vector.mult(vel[i], 1/60));
  }
}

function calcAccel() {
  for (let i = 0; i < pos.length; i++) {
    accel = new p5.Vector(0, 0);
    for (let j = 0; j < pos.length; j++) {
      if(i != j){
        let distance = calcDistance(pos[i], pos[j]);
        let magDistance = distance.mag();
        
        accel = p5.Vector.add(accel, p5.Vector.mult(distance, 25 * mass[j] / (magDistance * magDistance * magDistance)));
      }
    }
    acc[i] = accel;
  }
}

function collide() {
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      let distance = calcDistance(pos[i], pos[j]);
      let negDistance = p5.Vector.mult(distance, -1);
      let magDistance = distance.mag();
      
      if(magDistance <= 25) {
        let mass1 = 2 * mass[j] / (mass[i] + mass[j]);
        let mass2 = 2 * mass[i] / (mass[i] + mass[j]);

        let vectorDotQuantity1 = negDistance.dot(p5.Vector.sub(vel[i], vel[j]))/ (magDistance * magDistance);
        let vectorDotQuantity2 = distance.dot(p5.Vector.sub(vel[j], vel[i]))/ (magDistance * magDistance);

        vel[i].sub(p5.Vector.mult(distance, mass1 * vectorDotQuantity1));
        vel[j].sub(p5.Vector.mult(distance, mass2 * vectorDotQuantity2));
      }
    }
  }
}

function calcDistance(pos1, pos2){
  return new p5.Vector(pos2.x - pos1.x, pos2.y - pos1.y);
}

function setVel(setpoint) {
  let err = setpoint - vel[2].mag();
  let kP = 90;
  let maxAccel;
  if (err > 0) {
    maxAccel = 120;
  } else {
    maxAccel = -120;
  }
  
  if(abs(err) > 0.01) {
    let acceleration =  kP * err;
    
    if(abs(acceleration) < abs(maxAccel)) {
        acc[2].add(p5.Vector.mult(vel[2], acceleration/vel[2].mag()));
    } else {
        acc[2].add(p5.Vector.mult(vel[2], maxAccel/vel[2].mag()));
    }
  }
}

function normalAccel(isPositive, mag) {
  let angle = PI / 2;
  if(!isPositive) {
    angle *= -1;
  }
  
  acc[2].add(p5.Vector.mult(vel[2], mag/vel[2].mag()).setHeading(vel[2].heading() + angle));
}

function setHeading(heading){
  let measurement = vel[2].heading();
  
  let err = heading - measurement;
  if(abs(err) > PI) {
    err = 2 * PI - err;
  }
  let kP = 180;
  
  if(abs(err) > 0.01) {
    if(err > 0) {
      normalAccel(true, kP * err);
    } else {
      normalAccel(false, kP * err);
    }
  }
}

function findClosestObject() {
  let distance1 = p5.Vector.sub(pos[0], pos[2]);
  let distance2 = p5.Vector.sub(pos[1], pos[2]);
  
  if(distance1.mag() > distance2.mag()) {
    return 1;
  } else {
    return 0;
  }
}

function orbit(object) {
  let distance = p5.Vector.sub(pos[object], pos[2]);
  let headingSetpoint;
  if(((distance.heading() + PI / 2) - vel[2].heading()) > ((distance.heading() - PI / 2) - vel[2].heading())) {
    headingSetpoint = distance.heading() - PI / 2;
  } else {
    headingSetpoint = distance.heading() + PI / 2;
  }
  let orbitSpeed = sqrt(25 * mass[0] / distance.mag());
  let orbitVel = new p5.Vector(orbitSpeed * cos(headingSetpoint), orbitSpeed * sin(headingSetpoint));
  orbitVel.add(vel[object]);
    
  setVel(orbitVel.mag());
  setHeading(orbitVel.heading());
}



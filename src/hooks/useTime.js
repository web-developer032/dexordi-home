import React, { useState, useEffect } from "react";
import axios from "axios";
import { worldTimeApi } from "../utils/apiRoutes";
import moment, { duration } from "moment/moment";

const formatNumber = (number) => {
  if (number >= 10) return number.toString();
  else return '0' + number.toString();
}

const parseDuration = (duration) => {
  return {
    days: formatNumber(duration.days()),
    hours: formatNumber(duration.hours()),
    minutes: formatNumber(duration.minutes()),
    seconds: formatNumber(duration.seconds()),
  }
}

var date = new Date("June 13, 2023 09:00:00 EST");

// Convert the date to UTC
var utcDate = new Date(date.toUTCString());

// Calculate the Unix timestamp by dividing the UTC date by 1000 to get seconds
var unixTimestamp = Math.floor(utcDate.getTime() / 1000);

console.log('unixTimestamp', unixTimestamp);

export function useTime(startTime = moment.unix(1686664800), endTime = moment.unix(1686664800 + 7 * 24 * 3600)) {
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [deltaLocal, setDeltaLocal] = useState(0);
  const [remainingTimeStamp, setRemainingTimestamp] = useState(0);
  const [delta1, setDelta1] = useState(null);
  const [delta2, setDelta2] = useState(null);

  const getCurrentTimestamp = async () => {
    const { data } = await axios.get(worldTimeApi);
    const { unixtime } = data;
    const localMoment = moment();
    const worldMoment = moment.unix(unixtime);
    console.log('unixtime :>> ', worldMoment, startTime);
    const deltaLocal = worldMoment - localMoment;

    // console.log('worldMoment :>> ', worldMoment.format());
    // console.log('currentMome :>> ', localMoment.format());

    setCurrentTimestamp(localMoment);
    setDeltaLocal(deltaLocal);
  }

  const calculate = () => {
    const current = moment.unix((moment() + deltaLocal) / 1000);
    // console.log('currentMome :>> ', deltaLocal, current.format());

    const delta1 = startTime - (current);
    const delta2 = endTime - (current);
    const duration1 = moment.duration(delta1)
    const duration2 = moment.duration(delta2)
    setDelta1(parseDuration(duration1));
    setDelta2(parseDuration(duration2));
  }

  useEffect(() => {
    getCurrentTimestamp();
    const interval = setInterval(() => {
      calculate();
    }, 1000);

    return () => {
      clearInterval(interval);
    }
  }, [])

  return [currentTimestamp, delta1, delta2];
}
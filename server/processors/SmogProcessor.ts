export class SmogProcessor {
    private _dataFolder;

    constructor(dataFolder) {
      this._dataFolder = dataFolder;
    }

    getDayInRangesJson(day: string, range: number) {
      const days = this.getAllDays();
      const index = days.indexOf(day);

      if (index === -1) {
        throw new Error('No such day in list!');
      } else {
        const indexOfDay = days[index];
        const minutes = this.readMinutesFromFile(indexOfDay);
        const averages = this.countAverages(minutes, range);
        return {
          day: indexOfDay,
          unit: {
            pm10: 'mcg/m3',
            pm2_5: 'mcg/m3',
          },
          minuteAverages: averages,
        };
      }

    }

    getAllDays() {
      const fs = require('fs');
      const regex = /smog_(\d+-\d+-\d+).txt/;
      const days = [];
      fs.readdirSync(this._dataFolder).forEach(file => {
        const matchDate = file.match(regex);
        if (matchDate) {
          const day = matchDate[1];
          days.push(day);
        }
      });
      return days;
    }

    private pad(n) {
      return (n < 10) ? ('0' + n) : n;
    }

    readMinutesFromFile(indexOfDay) {
      const file = this.readDayFile(indexOfDay);
      const allRows = file.toString().split(/[\r\n]+/);
      const minutes = [];
      for (let i = 0; i < allRows.length; ++i) {
        if (allRows[i].length === 0) {
          break;
        }
        const rowRegex = /^([0-9]{2} [A-Za-z]{3} [0-9]+) ([0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+)\: (.*)$/;
        const rowData = allRows[i].match(rowRegex);
        const date = rowData[1];
        const time = rowData[2];
        const measurments = rowData[3];

        const dustRegex = /^PM2\.5 (.*) mcg\/m3, PM10: (.*) mcg\/m3$/;
        const dust = measurments.match(dustRegex);
        const PM2_5 = dust[1];
        const PM10 = dust[2];

        const timestamp = Date.parse(date + ' ' + time);
        const datetime = new Date(timestamp);

        const minute = datetime.getMinutes();
        const hour = datetime.getHours();
        const second = datetime.getSeconds();

        const minuteIndex = this.pad(hour) + ':' + this.pad(minute);

        if (minutes[minuteIndex]) {
          minutes[minuteIndex].seconds.push({second: second, pm2_5: parseFloat(PM2_5), pm10: parseFloat(PM10)});
          minutes[minuteIndex].sumPM2_5 += parseFloat(PM2_5);
          minutes[minuteIndex].sumPM10 += parseFloat(PM10);
        } else {
          minutes[minuteIndex] = {
             seconds: [{second: second, pm2_5: parseFloat(PM2_5), pm10: parseFloat(PM10)}],
             sumPM2_5: parseFloat(PM2_5),
             sumPM10: parseFloat(PM10),
          };
        }
      }
      return minutes;
    }

    private minutesBands(divider) {
      const bands = [];
      for (let i = 0; i < 24 * 60; i += 1 ) {
        if (i % divider === 0) {
          bands[i] = [];
        }
        bands[i - i % divider].push(i);
      }
      return bands;
    }

    countAverages(minutes, divider) {
      const averages = [];
      if (divider === 1) {
        for ( const key in minutes ) {
          if (key) {
            averages.push({
              minute: key,
              pm10: minutes[key].sumPM10 / minutes[key].seconds.length,
              pm2_5: minutes[key].sumPM2_5 / minutes[key].seconds.length,
              count: minutes[key].seconds.length
            });
          }
        }

      } else {
        const bands = this.minutesBands(divider);
        for (const bandLead in bands) {
          if (bandLead) {
            let bandPM10 = 0;
            let bandPM2_5 = 0;
            let bandCount = 0;
            let skippedMinutes = 0;
            const leadMinuteIndex = this.pad(( +bandLead - +bandLead % 60) / 60) + ':' + this.pad(+bandLead % 60);
            for (const bandMemberIndex in bands[bandLead]) {
              if (bandMemberIndex) {
                const bandMember = bands[bandLead][bandMemberIndex];
                const memberMinuteIndex = this.pad((bandMember - bandMember % 60) / 60) + ':' + this.pad(bandMember % 60);

                if (minutes[memberMinuteIndex]) {
                  bandPM10 += minutes[memberMinuteIndex].sumPM10;
                  bandPM2_5 += minutes[memberMinuteIndex].sumPM2_5;
                  bandCount += minutes[memberMinuteIndex].seconds.length;
                } else {
                  skippedMinutes += 1;
                }
              }
            }
            if (bandCount) {
              averages.push({
                minuteRange: leadMinuteIndex,
                pm10: bandPM10 / bandCount,
                pm2_5: bandPM2_5 / bandCount,
                count: bandCount,
                skippedMinutes: skippedMinutes
              });
            }
          }
        }
      }
      return averages;
    }

    private readDayFile(day) {
      const filename = this._dataFolder + '/smog_' + day + '.txt';
      const fs = require('fs');
      return fs.readFileSync(filename);
    }
}

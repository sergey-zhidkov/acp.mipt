import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class Main051 {
    public static void main(String args[]) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int roomNumber = Integer.parseInt(br.readLine());

        if (roomNumber == 1) {
            System.out.println(1 + " " + 1);
            return;
        }

        int floor = 1;
        int firstRoomOnLevel = 1;
        int width = 1;
        int height = 1;
        int lastRoomOnLevel;

        while (true) {
            width++;
            height++;
            lastRoomOnLevel = width * height + firstRoomOnLevel;
            if (lastRoomOnLevel >= roomNumber) {
                break;
            }
            floor += height;
            firstRoomOnLevel = lastRoomOnLevel;
        }

        int diff = roomNumber - firstRoomOnLevel;
        int floorDiff = (diff - 1) / width;
        int leftDiff = diff - (floorDiff * width);
        System.out.println((floorDiff + floor + 1) + " " + leftDiff);
    }
}


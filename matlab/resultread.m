CLASSES = {'Original' 'Low' 'High'};

data = jsondecode(fileread('out.json'));
dataFields = fields(data);

% Count images by category and preallocate memory
imgCountCompr = 0;
imgCountNoise = 0;
for i = 1:length(dataFields)
  switch dataFields{i}(1)
    case 'c'
      imgCountCompr = imgCountCompr + 1;
    case 'n'
      imgCountNoise = imgCountNoise + 1;
  end
end

comprData = reshape(zeros(1, imgCountCompr), [], length(CLASSES));
noiseData = reshape(zeros(1, imgCountNoise), [], length(CLASSES));

% Fill in collected data
for i = 1:length(dataFields)
    fileName = dataFields{i};
    
    col = find(['0' 'l' 'h'] == fileName(2));
    
    switch fileName(1)
        case 'n'
            row = find(noiseData(:, col) == 0, 1);
            noiseData(row, col) = data.(fileName);
        case 'c'
            row = find(comprData(:, col) == 0, 1);
            comprData(row, col) = data.(fileName);
    end
end

% Draw box plots w/ mean
figure('Name', 'Compression box plot'), hold on;
boxplot(comprData, 'Labels', CLASSES);
plot(mean(comprData), 'dr');
xlabel('Quality pool'), ylabel('Mark');
title('Subjective evaluation results (compression)');

figure('Name', 'Noise box plot'), hold on;
boxplot(noiseData, 'Labels', CLASSES);
plot(mean(noiseData), 'dr');
xlabel('Quality pool'), ylabel('Mark');
title('Subjective evaluation results (noise)');

function resultshow( dirPath )
%RESULTSHOW(DIRPATH) Generates plots from subj. eval. data in directory

if ~isdir(dirPath)
    error('Given path is not a directory');
end

data = loaddata(dirPath);
[~, datasetName, ~] = fileparts(dirPath);
%assignin('base', 'experimentData', data);

% Boxplot all user ratings by category
plotbin(data, datasetName, 'Rating', 'r');
plotbin(data, datasetName, 'Reaction time', 't');

% "Funny" stats: mean rating and reaction time by subject
plotsubj(data, datasetName, 'Mean rank given', 'r', false);
plotsubj(data, datasetName, 'Mean reaction time', 't', true);
end


function data = loaddata( dirPath )
%LOADDDATA(DIRPATH) Loads subject JSON data from the given directory

files = dir(dirPath);
data = struct;

for i = 1:length(files)
    if ~endsWith(files(i).name, '.json')
        continue;
    end

    fileName = fullfile(dirPath, files(i).name);
    fileData = jsondecode(fileread(fileName));

    [~, fieldName, ~] = fileparts(files(i).name);
    fieldName = matlab.lang.makeValidName(lower(fieldName));
    data.(fieldName) = fileData;
end
end


function plotbin( data, dsetName, plotDesc, attr )
%PLOTBIN(DATA,DSETNAME,PLOTDESC,ATTR) Box plots results by class

[names, plotd] = bincoll(data, attr);

if nnz(plotd) == 0
    % Do not plot anything if there is no data for this set
    return;
end

figure('Name', sprintf('[%s] %s box plot', dsetName, plotDesc)), hold on;
boxplot(plotd, 'Labels', names);
plot(mean(plotd), 'dr');
xlabel('Quality pool'), ylabel(plotDesc);
title(sprintf('Subjective evaluation results (%s)', lower(plotDesc)));
end


function plotsubj( data, dsetName, plotDesc, attr, reverse )
%PLOTSUBJ(DATA,DSETNAME,PLOTDESC,ATTR,REVERSE) Box plots results by subject

[names, plotd, plotm] = subjcoll(data, attr);

if nnz(plotd) == 0
    % Do not plot anything if there is no data for this set
    return;
end

figure('Name', sprintf('[%s] %s', dsetName, plotDesc)), hold on;
boxplot(plotd, 'Labels', names, ...
    'Orientation', 'horizontal', 'PlotStyle', 'compact');
barh(plotm, 'EdgeAlpha', 0, 'FaceAlpha', 0.3);
if reverse
    set(gca,'Ydir','reverse');
end
title(sprintf('%s by subject', plotDesc));
end


function [ binNames, plotd ] = bincoll( data, attrName )
%BINCOLL(DATA,ATTRNAME) Collects experiment data by impairment class

binNames = {'Original image' 'Low impairment' 'High impairment'};
binFileNames = ['0' 'l' 'h'];

% Assume that the assessed images list
% has the same order and length for all subjects
subjNames = fields(data);
imageNames = fields(data.(subjNames{1}));


% Generate output attribute matrix for boxplot, #images x #bins
plotd = zeros( ...
    length(subjNames) * length(imageNames) / length(binNames), ...
    length(binNames));
nextIdx = ones(1,3);
for iSubj = 1:length(subjNames)
    for iImg = 1:length(imageNames)
        col = find(binFileNames == imageNames{iImg}(2));

        plotd(nextIdx(col), col) = ...
            data.(subjNames{iSubj}).(imageNames{iImg}).(attrName);
        nextIdx(col) = nextIdx(col) + 1;
    end
end
end


function [ subjNames, plotd, m ] = subjcoll( data, attrName )
%SUBJCOLL(DATA,ATTRNAME) Collects experiment data attribute by subject

% Assume that the assessed images list
% has the same order and length for all subjects
subjNames = fields(data);
imageNames = fields(data.(subjNames{1}));

% Generate output attribute matrix for boxplot, #images x #subjects
plotd = zeros(length(imageNames), length(subjNames));
for c = 1:length(subjNames)
    for r = 1:length(imageNames)
        plotd(r, c) = data.(subjNames{c}).(imageNames{r}).(attrName);
    end
end

% Sort output data by column mean
[m, idx] = sort(mean(plotd));
plotd = plotd(:, idx);
subjNames = subjNames(idx);
end
